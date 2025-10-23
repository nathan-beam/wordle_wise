from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import defaultdict
import os

app = Flask(__name__)
CORS(app)


class LetterBreakdown:
    def __init__(self, words, previous_letters):
        self.previous_letters = previous_letters
        self.words = words
        self.letter_dict = defaultdict(list)
        for w in words:
            word = w.strip()
            for letter in word:
                if word not in self.letter_dict[letter] and letter not in previous_letters:
                    self.letter_dict[letter].append(word)

    def get_next_logical_breakdown(self):
        if not self.letter_dict:
            return self

        word_len = len(self.words)
        closest_split = min(self.letter_dict.keys(), key=lambda x: abs(
            len(self.letter_dict[x])-word_len/2))

        if closest_split in self.previous_letters:
            return self
        return LetterBreakdown(self.letter_dict[closest_split], self.previous_letters + closest_split)

    def get_previous_letters(self):
        return self.previous_letters


def load_wordlist():
    """Load the wordlist from file"""
    with open("static/wordlist.txt") as file:
        return [word.strip() for word in file.readlines()]


def filter_words(words, correct_letters, invalid_positions, valid_letters, invalid_letters, hard_mode, exclude_known_letters):
    """Filter words based on the constraints"""
    valid_words = []

    for word in words:
        invalid_word = False

        # Hard mode: must contain all valid letters
        if hard_mode:
            for letter in valid_letters:
                if letter not in word:
                    invalid_word = True
                    break

        if invalid_word:
            continue

        # Check each position
        for i, letter in enumerate(word):
            # Letter is completely invalid
            if letter in invalid_letters:
                invalid_word = True
                break

            # Letter is in wrong position
            if letter in invalid_positions[i]:
                invalid_word = True
                break

            # Hard mode: correct letters must be in correct positions
            if correct_letters.get(i) and correct_letters[i] != letter and hard_mode:
                invalid_word = True
                break

            # Exclude known letters option
            if exclude_known_letters and letter in valid_letters:
                invalid_word = True
                break

        if not invalid_word:
            valid_words.append(word)

    return valid_words


def get_best_guesses(valid_words, valid_letters, correct_letters):
    """Get the best guesses using the LetterBreakdown algorithm"""
    excluded_letters = "".join(valid_letters)
    for v in correct_letters.values():
        excluded_letters += v

    lb = LetterBreakdown(valid_words, excluded_letters)
    while len(lb.previous_letters) < 5 and len(lb.words) > 1:
        lb = lb.get_next_logical_breakdown()

    return lb.words[:10]  # Return top 10 suggestions


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')


@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('static', filename)


@app.route('/api/solve', methods=['POST'])
def solve_wordle():
    """Main API endpoint for solving Wordle"""
    try:
        data = request.json

        # Parse input data
        correct_letters = {}
        invalid_positions = defaultdict(list)
        valid_letters = []
        invalid_letters = []

        # Process grid data
        grid = data.get('grid', [])
        for row_idx, row in enumerate(grid):
            for col_idx, cell in enumerate(row):
                letter = cell.get('letter', '').lower()
                status = cell.get('status', '')

                if letter and status:
                    if status == 'correct':
                        correct_letters[col_idx] = letter
                    elif status == 'present':
                        invalid_positions[col_idx].append(letter)
                        if letter not in valid_letters:
                            valid_letters.append(letter)
                    elif status == 'absent':
                        invalid_letters.append(letter)

        hard_mode = data.get('hard_mode', False)
        exclude_known_letters = data.get('exclude_known_letters', False)

        # Load wordlist and filter
        words = load_wordlist()
        valid_words = filter_words(
            words, correct_letters, invalid_positions,
            valid_letters, invalid_letters, hard_mode, exclude_known_letters
        )

        # If there's only one valid word, return it as the answer
        if len(valid_words) == 1:
            return jsonify({
                'success': True,
                'valid_words_count': 1,
                'suggestions': [valid_words[0]],
                'valid_words': valid_words,
                'answer_found': True,
                'message': f"Only one possible word remains: {valid_words[0].upper()}"
            })

        # Always run hard mode analysis as fallback for better suggestions
        hard_mode_words = filter_words(
            words, correct_letters, invalid_positions,
            valid_letters, invalid_letters, True, exclude_known_letters  # Force hard mode
        )

        # Get suggestions - prefer hard mode if it gives reasonable results
        if len(hard_mode_words) == 1:
            return jsonify({
                'success': True,
                'valid_words_count': 1,
                'suggestions': [hard_mode_words[0]],
                'valid_words': hard_mode_words,
                'answer_found': True,
                'message': f"Only one possible word remains: {hard_mode_words[0].upper()}"
            })
        else:
            # Fall back to user's original settings
            suggestions = get_best_guesses(
                valid_words, valid_letters, correct_letters)
            suggestion_source = "normal_mode"

        return jsonify({
            'success': True,
            'valid_words_count': len(valid_words),
            'hard_mode_count': len(hard_mode_words),
            'suggestions': suggestions,
            'suggestion_source': suggestion_source,
            'valid_words': valid_words[:50] if len(valid_words) <= 100 else [],
            'answer_found': False
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/wordlist', methods=['GET'])
def get_wordlist():
    """Get the complete wordlist"""
    try:
        words = load_wordlist()
        return jsonify({
            'success': True,
            'words': words,
            'count': len(words)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
