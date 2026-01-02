document.addEventListener("DOMContentLoaded", () => {
  const fixedScoreboardBody = document.getElementById("fixed-scoreboard-body");
  const scrollableScoreboardBody = document.getElementById(
    "scrollable-scoreboard-body"
  );

  // --- LocalStorage Logic ---
  const STORAGE_KEY = "miniGolfScoreData";

  function saveData() {
    const data = {
      players: []
    };

    const playerRows = fixedScoreboardBody.querySelectorAll(".player-row");
    playerRows.forEach((row, index) => {
      const name = row.querySelector(".player-name").textContent.trim();
      const scrollableRow = scrollableScoreboardBody.children[index];
      const scores = [];

      if (scrollableRow) {
        const scoreCells = scrollableRow.querySelectorAll(".score-cell");
        scoreCells.forEach(cell => {
          const plus = cell.querySelector(".score-plus").textContent.trim();
          const minus = cell.querySelector(".score-minus").textContent.trim();
          scores.push({ plus, minus });
        });
      }

      data.players.push({ name, scores });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadData() {
    const dataJSON = localStorage.getItem(STORAGE_KEY);
    if (!dataJSON) return;

    try {
      const data = JSON.parse(dataJSON);
      const fixedRows = fixedScoreboardBody.querySelectorAll(".player-row");
      const scrollableRows = scrollableScoreboardBody.querySelectorAll(".player-row");

      data.players.forEach((player, index) => {
        if (fixedRows[index] && scrollableRows[index]) {
          // Restore Name
          fixedRows[index].querySelector(".player-name").textContent = player.name;

          // Restore Scores
          const scoreCells = scrollableRows[index].querySelectorAll(".score-cell");
          player.scores.forEach((score, sIndex) => {
            if (scoreCells[sIndex]) {
              scoreCells[sIndex].querySelector(".score-plus").textContent = score.plus;
              scoreCells[sIndex].querySelector(".score-minus").textContent = score.minus;
            }
          });

          // Update Total
          updateTotalScore(scrollableRows[index], fixedRows[index]);
        }
      });
      console.log("Data loaded from LocalStorage");
    } catch (e) {
      console.error("Failed to load data from LocalStorage", e);
    }
  }

  // --- Reset Modal Logic ---
  const resetButton = document.getElementById("reset-button");
  const resetModal = document.getElementById("reset-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const resetScoreOnlyBtn = document.getElementById("reset-score-only");
  const resetAllBtn = document.getElementById("reset-all");

  if (resetButton && resetModal) {
    resetButton.addEventListener("click", () => {
      resetModal.classList.remove("hidden");
    });

    const closeModal = () => {
      resetModal.classList.add("hidden");
    };

    closeModalBtn.addEventListener("click", closeModal);

    // Close on overlay click
    resetModal.addEventListener("click", (e) => {
      if (e.target === resetModal) {
        closeModal();
      }
    });

    resetScoreOnlyBtn.addEventListener("click", () => {
      const scrollableRows = scrollableScoreboardBody.querySelectorAll(".player-row");
      const fixedRows = fixedScoreboardBody.querySelectorAll(".player-row");

      scrollableRows.forEach((row, index) => {
        const plusDivs = row.querySelectorAll(".score-plus");
        const minusDivs = row.querySelectorAll(".score-minus");

        plusDivs.forEach(div => div.textContent = "0");
        minusDivs.forEach(div => div.textContent = "0");

        const fixedRow = fixedRows[index];
        if (fixedRow) {
          updateTotalScore(row, fixedRow);
        }
      });

      saveData();
      closeModal();
    });

    resetAllBtn.addEventListener("click", () => {
      const scrollableRows = scrollableScoreboardBody.querySelectorAll(".player-row");
      const fixedRows = fixedScoreboardBody.querySelectorAll(".player-row");

      // Reset Scores
      scrollableRows.forEach((row, index) => {
        const plusDivs = row.querySelectorAll(".score-plus");
        const minusDivs = row.querySelectorAll(".score-minus");

        plusDivs.forEach(div => div.textContent = "0");
        minusDivs.forEach(div => div.textContent = "0");

        const fixedRow = fixedRows[index];
        if (fixedRow) {
          // Reset Name
          fixedRow.querySelector(".player-name").textContent = "이름 입력";
          updateTotalScore(row, fixedRow);
        }
      });

      saveData();
      closeModal();
    });
  }


  // Function to synchronize row heights
  const synchronizeRowHeights = () => {
    const fixedRows = fixedScoreboardBody.querySelectorAll(".player-row");
    const scrollableRows =
      scrollableScoreboardBody.querySelectorAll(".player-row");

    fixedRows.forEach((fixedRow, index) => {
      const scrollableRow = scrollableRows[index];
      if (!scrollableRow) return;

      fixedRow.style.height = "";
      scrollableRow.style.height = "";

      const fixedHeight = fixedRow.offsetHeight;
      const scrollableHeight = scrollableRow.offsetHeight;
      const maxHeight = Math.max(fixedHeight, scrollableHeight);

      fixedRow.style.height = `${maxHeight}px`;
      scrollableRow.style.height = `${maxHeight}px`;
    });

    const fixedHeaderRow =
      fixedScoreboardBody.previousElementSibling.querySelector("tr");
    const scrollableHeaderRow =
      scrollableScoreboardBody.previousElementSibling.querySelector("tr");

    if (fixedHeaderRow && scrollableHeaderRow) {
      fixedHeaderRow.style.height = "";
      scrollableHeaderRow.style.height = "";

      const fixedHeaderHeight = fixedHeaderRow.offsetHeight;
      const scrollableHeaderHeight = scrollableHeaderRow.offsetHeight;
      const maxHeaderHeight = Math.max(
        fixedHeaderHeight,
        scrollableHeaderHeight
      );

      fixedHeaderRow.style.height = `${maxHeaderHeight}px`;
      scrollableHeaderRow.style.height = `${maxHeaderHeight}px`;
    }
  };

  function updateTotalScore(scrollableRow, fixedRow) {
    const plusScores = scrollableRow.querySelectorAll(".score-plus");
    const minusScores = scrollableRow.querySelectorAll(".score-minus");
    let total = 0;

    plusScores.forEach((div) => {
      const value = parseInt(div.textContent, 10) || 0;
      total += value;
    });

    minusScores.forEach((div) => {
      const value = parseInt(div.textContent, 10) || 0;
      total -= value;
    });

    if (fixedRow) {
      fixedRow.querySelector(".total-score").textContent = total;
    }
  }

  function getAssociatedRows(element) {
    const scrollableRow = element.closest(".player-row");
    if (!scrollableRow) return { scrollableRow: null, fixedRow: null };

    const rowIndex = Array.from(scrollableScoreboardBody.children).indexOf(
      scrollableRow
    );
    const fixedRow = fixedScoreboardBody.children[rowIndex];
    return { scrollableRow, fixedRow };
  }

  // Event delegation for entering edit mode on double-click
  scrollableScoreboardBody.addEventListener("click", (event) => {
    const target = event.target;
    // Find the closest editable div
    const editableDiv = target.closest(".score-plus, .score-minus");

    if (editableDiv) {
      enterEditMode(editableDiv);
    }
  });

  function enterEditMode(cell) {
    if (cell.querySelector("input")) {
      return; // Already in edit mode
    }

    const wasEditable = cell.isContentEditable;
    cell.contentEditable = false; // Disable to prevent event conflict

    const currentValue = cell.textContent.trim();
    cell.textContent = "";

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric"; // Enforce numeric keyboard on mobile
    input.pattern = "[0-9]*"; // Additional hint for iOS
    input.min = "0";
    input.max = "99";
    input.value = currentValue;
    input.style.width = "100%";
    input.style.height = "100%";
    input.style.border = "none";
    input.style.textAlign = "center";
    input.style.boxSizing = "border-box";
    input.style.font = "inherit";
    input.style.backgroundColor = "inherit";

    cell.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
      const newValue = input.value;
      cell.textContent = newValue || ""; // Restore empty if empty
      cell.contentEditable = wasEditable; // Restore original state
      if (input.parentNode) {
        input.remove();
      }

      const { scrollableRow, fixedRow } = getAssociatedRows(cell);
      if (scrollableRow && fixedRow) {
        updateTotalScore(scrollableRow, fixedRow);
        synchronizeRowHeights();
      }
      saveData(); // Save data after editing
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Stop default 'Enter' behavior
        finishEditing();
      } else if (e.key === "Escape") {
        cell.textContent = currentValue; // Restore original value
        cell.contentEditable = wasEditable; // Restore original state
        input.remove();
      }
    };

    const handleBlur = () => {
      // Check if the input is still in the DOM before acting
      if (document.body.contains(input)) {
        finishEditing();
      }
    };

    input.addEventListener("keydown", handleKeyDown);
    input.addEventListener("blur", handleBlur);
  }

  // Event listener for player name changes
  fixedScoreboardBody.addEventListener("input", (event) => {
    if (event.target.classList.contains("player-name")) {
      synchronizeRowHeights();
      saveData(); // Save data when name changes
    }
  });

  // Initial setup
  const allScrollablePlayerRows =
    scrollableScoreboardBody.querySelectorAll(".player-row");

  // Call loadData immediately to overwrite server data if local data exists
  loadData();

  allScrollablePlayerRows.forEach((scrollableRow, index) => {
    const fixedRow = fixedScoreboardBody.children[index];
    if (fixedRow) {
      updateTotalScore(scrollableRow, fixedRow);
    }
  });

  synchronizeRowHeights();

  // Optional: Synchronize heights on window resize and scroll
  window.addEventListener("resize", synchronizeRowHeights);
  document
    .querySelector(".scrollable-scores-container")
    .addEventListener("scroll", synchronizeRowHeights);

  // Player name cell functionality
  document.querySelectorAll(".player-name").forEach((playerCell) => {
    playerCell.addEventListener("click", function () {
      if (this.textContent.trim() === "") {
        this.focus();
      }
    });

    // Improved name clearing interaction: Only clear if explicitly requested or allow standard editing
    // The previous logic cleared on every click which is annoying. 
    // User request: "이름/점수 모두 지울지, 점수만 지울지" implied the Reset button handles mass clearing.
    // For individual cells, I'll keep the standard contentEditable behavior but ensure persistence.

    playerCell.addEventListener("keydown", function (event) {
      // If composition is in progress, do not process keydown for character input
      if (event.isComposing) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault(); // Prevent new line
        this.blur(); // Exit editing mode
      }
    });
  });
});
