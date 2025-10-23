class WordleSolver {
  constructor() {
    this.grid = [];
    this.currentRow = 0;
    this.init();
  }

  init() {
    this.createGrid();
    this.bindEvents();
    this.initializeGrid();
    console.log("Wordle Solver initialized. Mobile mode:", this.isMobile());
  }

  createGrid() {
    const gridElement = document.getElementById("wordle-grid");

    for (let row = 0; row < 6; row++) {
      const rowElement = document.createElement("div");
      rowElement.className = "row";

      const gridRow = [];
      for (let col = 0; col < 5; col++) {
        const cell = document.createElement("div");
        cell.className = "cell empty";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("click", () => this.handleCellClick(row, col));
        cell.addEventListener("keydown", (e) =>
          this.handleCellKeydown(e, row, col)
        );
        // Add input event for mobile browsers
        cell.addEventListener("input", (e) =>
          this.handleCellInput(e, row, col)
        );
        // Add paste event handler
        cell.addEventListener("paste", (e) =>
          this.handleCellPaste(e, row, col)
        );
        cell.contentEditable = true;
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("inputmode", "text");
        cell.setAttribute("autocomplete", "off");
        cell.setAttribute("autocorrect", "off");
        cell.setAttribute("spellcheck", "false");

        rowElement.appendChild(cell);
        gridRow.push({ letter: "", status: "" });
      }

      gridElement.appendChild(rowElement);
      this.grid.push(gridRow);
    }
  }

  initializeGrid() {
    // Initialize grid data
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        this.grid[row][col] = { letter: "", status: "" };
      }
    }
  }

  handleCellClick(row, col) {
    const cell = this.getCellElement(row, col);
    const letter = cell.textContent.trim().toUpperCase();

    if (!letter) {
      // If empty, focus for typing
      cell.focus();
      return;
    }

    // Cycle through states: empty -> absent -> present -> correct -> empty
    const currentStatus = this.grid[row][col].status;
    let newStatus = "";

    switch (currentStatus) {
      case "":
      case "empty":
        newStatus = "absent";
        break;
      case "absent":
        newStatus = "present";
        break;
      case "present":
        newStatus = "correct";
        break;
      case "correct":
        newStatus = "";
        cell.textContent = "";
        this.grid[row][col].letter = "";
        break;
    }

    this.grid[row][col].status = newStatus;
    this.updateCellAppearance(row, col);
  }

  handleCellKeydown(e, row, col) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const cell = this.getCellElement(row, col);

      // If current cell has content, clear it
      if (cell.textContent.trim()) {
        cell.textContent = "";
        this.grid[row][col] = { letter: "", status: "" };
        this.updateCellAppearance(row, col);
      } else {
        // If current cell is empty, move to previous cell and clear it
        const prevPosition = this.getPreviousCell(row, col);
        if (prevPosition) {
          const prevCell = this.getCellElement(
            prevPosition.row,
            prevPosition.col
          );
          prevCell.textContent = "";
          this.grid[prevPosition.row][prevPosition.col] = {
            letter: "",
            status: "",
          };
          this.updateCellAppearance(prevPosition.row, prevPosition.col);
          this.focusCell(prevCell);
        }
      }
      return;
    }

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.handleCellClick(row, col);
      return;
    }

    // Arrow key navigation with mobile support
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevPosition = this.getPreviousCell(row, col);
      if (prevPosition) {
        const targetCell = this.getCellElement(
          prevPosition.row,
          prevPosition.col
        );
        this.focusCell(targetCell);
      }
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextPosition = this.getNextCell(row, col);
      if (nextPosition) {
        const targetCell = this.getCellElement(
          nextPosition.row,
          nextPosition.col
        );
        this.focusCell(targetCell);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (row > 0) {
        const targetCell = this.getCellElement(row - 1, col);
        this.focusCell(targetCell);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (row < 5) {
        const targetCell = this.getCellElement(row + 1, col);
        this.focusCell(targetCell);
      }
      return;
    }

    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      const cell = this.getCellElement(row, col);
      cell.textContent = letter;
      this.grid[row][col].letter = letter;
      if (!this.grid[row][col].status) {
        this.grid[row][col].status = "absent";
      }
      this.updateCellAppearance(row, col);

      // Move to next cell with mobile-friendly focus
      const nextPosition = this.getNextCell(row, col);
      if (nextPosition) {
        const nextCell = this.getCellElement(
          nextPosition.row,
          nextPosition.col
        );
        this.focusCell(nextCell);
      }
    }
  }

  getCellElement(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  getPreviousCell(row, col) {
    // If not at the beginning of the row, move left
    if (col > 0) {
      return { row: row, col: col - 1 };
    }
    // If at the beginning of the row but not the first row, move to end of previous row
    else if (row > 0) {
      return { row: row - 1, col: 4 };
    }
    // If at the very beginning, return null
    return null;
  }

  getNextCell(row, col) {
    // If not at the end of the row, move right
    if (col < 4) {
      return { row: row, col: col + 1 };
    }
    // If at the end of the row but not the last row, move to beginning of next row
    else if (row < 5) {
      return { row: row + 1, col: 0 };
    }
    // If at the very end, return null
    return null;
  }

  handleCellInput(e, row, col) {
    // This handles input events, crucial for mobile browsers
    console.log("Mobile input event triggered:", {
      row,
      col,
      isMobile: this.isMobile(),
    });
    const cell = this.getCellElement(row, col);
    const content = cell.textContent || cell.innerText || "";

    // Extract only the last letter entered (in case multiple chars were entered)
    const letters = content.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const letter = letters.slice(-1); // Get the last letter

    if (letter && letter.match(/[A-Z]/)) {
      // Clear the cell and set just the single letter
      cell.textContent = letter;
      this.grid[row][col].letter = letter;
      if (!this.grid[row][col].status) {
        this.grid[row][col].status = "absent";
      }
      this.updateCellAppearance(row, col);

      // Move to next cell
      const nextPosition = this.getNextCell(row, col);
      if (nextPosition) {
        const nextCell = this.getCellElement(
          nextPosition.row,
          nextPosition.col
        );
        this.focusCell(nextCell);
      }
    } else if (!letter) {
      // If no valid letter, clear the cell
      cell.textContent = "";
      this.grid[row][col] = { letter: "", status: "" };
      this.updateCellAppearance(row, col);
    } else if (letters.length > 1) {
      // If multiple letters, just take the first one
      cell.textContent = letters.charAt(0);
      this.grid[row][col].letter = letters.charAt(0);
      if (!this.grid[row][col].status) {
        this.grid[row][col].status = "absent";
      }
      this.updateCellAppearance(row, col);
    }
  }

  handleCellPaste(e, row, col) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const letters = paste.replace(/[^a-zA-Z]/g, "").toUpperCase();

    if (letters.length > 0) {
      // Paste letters across multiple cells
      let currentRow = row;
      let currentCol = col;

      for (let i = 0; i < letters.length && currentRow < 6; i++) {
        if (currentCol >= 5) {
          currentRow++;
          currentCol = 0;
        }
        if (currentRow >= 6) break;

        const cell = this.getCellElement(currentRow, currentCol);
        cell.textContent = letters[i];
        this.grid[currentRow][currentCol].letter = letters[i];
        if (!this.grid[currentRow][currentCol].status) {
          this.grid[currentRow][currentCol].status = "absent";
        }
        this.updateCellAppearance(currentRow, currentCol);

        currentCol++;
      }

      // Focus the last cell that was filled
      if (currentCol > 0) {
        currentCol--;
      } else if (currentRow > row) {
        currentRow--;
        currentCol = 4;
      }
      const lastCell = this.getCellElement(currentRow, currentCol);
      this.focusCell(lastCell);
    }
  }

  isMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
    );
  }

  focusCell(cell) {
    // Mobile-friendly focus method
    if (this.isMobile()) {
      console.log("Using mobile focus with click trigger");
      setTimeout(() => {
        cell.focus();
        cell.click();
      }, 50);
    } else {
      cell.focus();
    }
  }

  updateCellAppearance(row, col) {
    const cell = this.getCellElement(row, col);
    const { letter, status } = this.grid[row][col];

    cell.className = "cell";
    if (status) {
      cell.classList.add(status);
    } else {
      cell.classList.add("empty");
    }
  }

  bindEvents() {
    // Solve button
    document.getElementById("solve-btn").addEventListener("click", () => {
      this.solvePuzzle();
    });

    // Clear button
    document.getElementById("clear-btn").addEventListener("click", () => {
      this.clearAll();
    });
  }

  clearAll() {
    // Clear grid
    this.initializeGrid();

    // Update visual grid
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        const cell = this.getCellElement(row, col);
        cell.textContent = "";
        cell.className = "cell empty";
      }
    }

    // Clear inputs
    document.getElementById("hard-mode").checked = false;
    document.getElementById("exclude-known").checked = false;

    // Hide results
    document.getElementById("results").style.display = "none";
  }

  async solvePuzzle() {
    const loading = document.getElementById("loading");
    const solveBtn = document.getElementById("solve-btn");

    try {
      // Show loading
      loading.style.display = "flex";
      solveBtn.disabled = true;

      // Prepare data - collect invalid letters from gray squares in the grid
      const invalidLetters = [];
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = this.grid[row][col];
          if (cell.letter && cell.status === "absent") {
            const letter = cell.letter.toLowerCase();
            if (!invalidLetters.includes(letter)) {
              invalidLetters.push(letter);
            }
          }
        }
      }

      const hardMode = document.getElementById("hard-mode").checked;
      const excludeKnownLetters =
        document.getElementById("exclude-known").checked;

      const requestData = {
        grid: this.grid,
        invalid_letters: invalidLetters,
        hard_mode: hardMode,
        exclude_known_letters: excludeKnownLetters,
      };

      // Make API call
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        this.displayResults(result);
      } else {
        this.showError(result.error || "An error occurred while solving");
      }
    } catch (error) {
      console.error("Error:", error);
      this.showError("Failed to connect to the solver. Please try again.");
    } finally {
      // Hide loading
      loading.style.display = "none";
      solveBtn.disabled = false;
    }
  }

  displayResults(result) {
    const resultsSection = document.getElementById("results");
    const wordCount = document.getElementById("word-count");
    const suggestionList = document.getElementById("suggestion-list");
    const allWordsSection = document.getElementById("all-words-section");
    const allWordsList = document.getElementById("all-words-list");

    // Update word count
    wordCount.textContent = result.valid_words_count;

    // Clear previous suggestions
    suggestionList.innerHTML = "";

    // Handle single word answer
    if (result.answer_found) {
      const answerElement = document.createElement("div");
      answerElement.className = "suggestion-word answer-found";
      answerElement.textContent = `🎉 ${result.suggestions[0].toUpperCase()} 🎉`;
      answerElement.style.background =
        "linear-gradient(135deg, #6aaa64, #5a9a54)";
      answerElement.style.fontSize = "1.3rem";
      answerElement.style.gridColumn = "1 / -1";
      suggestionList.appendChild(answerElement);

      const messageElement = document.createElement("p");
      messageElement.style.cssText =
        "color: #6aaa64; text-align: center; font-weight: bold; margin-top: 10px; grid-column: 1 / -1;";
      messageElement.textContent = result.message;
      suggestionList.appendChild(messageElement);
    } else {
      // Display normal suggestions with source info
      if (result.suggestions && result.suggestions.length > 0) {
        // Add suggestion source info
        if (result.suggestion_source === "hard_mode") {
          const sourceInfo = document.createElement("p");
          sourceInfo.style.cssText =
            "color: #c9b458; text-align: center; margin-bottom: 10px; font-size: 0.9rem; grid-column: 1 / -1;";
          sourceInfo.textContent = `💡 Enhanced suggestions using hard mode logic (${
            result.hard_mode_count || result.valid_words_count
          } words)`;
          suggestionList.appendChild(sourceInfo);
        }

        result.suggestions.forEach((word) => {
          const wordElement = document.createElement("div");
          wordElement.className = "suggestion-word";
          wordElement.textContent = word.toUpperCase();
          suggestionList.appendChild(wordElement);
        });
      } else {
        suggestionList.innerHTML =
          '<p style="color: #818384; grid-column: 1 / -1; text-align: center;">No suggestions available</p>';
      }
    }

    // Display all words if available and count is reasonable (but not if answer is found)
    if (result.answer_found) {
      // Hide all words section when answer is found
      allWordsSection.style.display = "none";
    } else if (result.valid_words && result.valid_words.length > 0) {
      allWordsSection.style.display = "block";
      allWordsList.innerHTML = "";

      result.valid_words.forEach((word) => {
        const wordElement = document.createElement("div");
        wordElement.className = "word-item";
        wordElement.textContent = word.toUpperCase();
        allWordsList.appendChild(wordElement);
      });
    } else if (result.valid_words_count <= 100) {
      allWordsSection.style.display = "none";
    } else {
      allWordsSection.style.display = "block";
      allWordsList.innerHTML =
        '<p style="color: #818384; grid-column: 1 / -1; text-align: center;">Too many words to display (showing suggestions only)</p>';
    }

    // Show results
    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  showError(message) {
    // Create error message
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Utility method to get current state for debugging
  getGridState() {
    // Collect invalid letters from gray squares in the grid
    const invalidLetters = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        const cell = this.grid[row][col];
        if (cell.letter && cell.status === "absent") {
          const letter = cell.letter.toLowerCase();
          if (!invalidLetters.includes(letter)) {
            invalidLetters.push(letter);
          }
        }
      }
    }

    return {
      grid: this.grid,
      invalid_letters: invalidLetters,
      hard_mode: document.getElementById("hard-mode").checked,
      exclude_known_letters: document.getElementById("exclude-known").checked,
      isMobile: this.isMobile(),
    };
  }

  // Debug method to show grid state in console
  debugGrid() {
    console.log("=== GRID DEBUG ===");
    console.log("Mobile mode:", this.isMobile());
    console.log("Grid state:", this.getGridState());

    // Show visual representation
    for (let row = 0; row < 6; row++) {
      let rowStr = `Row ${row}: `;
      for (let col = 0; col < 5; col++) {
        const cell = this.grid[row][col];
        const letter = cell.letter || "_";
        const status = cell.status ? cell.status[0].toUpperCase() : "E";
        rowStr += `${letter}(${status}) `;
      }
      console.log(rowStr);
    }
    console.log("=================");
  }
}

// Initialize the solver when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.wordleSolver = new WordleSolver();

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          document.getElementById("solve-btn").click();
          break;
        case "Backspace":
          if (e.shiftKey) {
            e.preventDefault();
            document.getElementById("clear-btn").click();
          }
          break;
      }
    }
  });
});

// Add some helpful console commands for debugging
console.log(
  "Wordle Solver loaded! Use window.wordleSolver to access the solver instance."
);
console.log(
  "Keyboard shortcuts: Arrow keys to navigate, Backspace to delete & move back, Space/Enter to cycle colors, Ctrl+Enter to solve, Ctrl+Shift+Backspace to clear all"
);
console.log(
  "Debug commands: window.wordleSolver.getGridState(), window.wordleSolver.debugGrid()"
);
