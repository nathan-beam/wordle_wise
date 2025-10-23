# 🟨 Wordle Solver Web Frontend 🟩

A beautiful, modern Wordle solver that uses (something like) a binary search to help you solve Wordle puzzles efficiently.

## Features

- **Interactive Wordle Grid**: Click on letters to cycle through states (gray/yellow/green)
- **Smart Suggestions**: Uses your original combinatorics algorithm to suggest optimal guesses
- **Modern UI**: Beautiful, responsive design that matches Wordle's aesthetic
- **Hard Mode Support**: Respects Wordle's hard mode constraints
- **Flexible Options**: Option to exclude known letters for broader guessing strategies
- **Real-time Analysis**: Instant feedback on possible word count and suggestions

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**:
   ```bash
   python app.py
   ```

3. **Open Your Browser**:
   Navigate to `http://localhost:5001`

## How to Use

### 1. Enter Your Guesses
- **Type letters** directly into the grid cells
- **Click on letters** to cycle through states:
  - **Gray**: Letter is not in the word
  - **Yellow**: Letter is in the word but wrong position
  - **Green**: Letter is in the correct position

### 2. Choose Options
- **Hard Mode**: Forces suggestions to use all revealed hints (like the real Wordle hard mode)
- **Exclude Known Letters**: Provides broader suggestions by excluding letters you already know

### 3. Get Solutions
- Click **"🔍 Solve Puzzle"** to get your optimal next guesses
- The solver will show:
  - Number of possible words remaining
  - Best strategic guesses (top suggestions)
  - All possible words (if 50 or fewer)
- It will also run a "hard mode" check. If only 1 word is possible, we've solved the puzzle!

### 4. Keyboard Shortcuts
- **Ctrl+Enter**: Solve puzzle
- **Ctrl+Shift+Backspace**: Clear all
- **Space/Enter**: Cycle through letter states when cell is focused
- **Backspace**: Clear current cell

## How It Works

The web frontend wraps a Python algorithm:

1. **LetterBreakdown Algorithm**: Analyzes letter frequency across possible words
2. **Strategic Splitting**: Finds letters that split the remaining possibilities most evenly
3. **Constraint Satisfaction**: Filters words based on your known information
4. **Optimal Suggestions**: Recommends words that maximize information gain

## API Endpoints

- `GET /`: Serve the main web interface
- `POST /api/solve`: Solve Wordle puzzle with provided constraints
- `GET /api/wordlist`: Get the complete word list

## Project Structure

```
wordle_solver/
├── app.py              # Flask backend server
├── index.html          # Main web interface
├── static/
│   ├── style.css       # Modern styling
│   ├── script.js       # Interactive functionality
│   └── wordlist.txt    # Word database (2000+ words)
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## License

MIT License

---

**Made with ❤️ for Wordle enthusiasts **
