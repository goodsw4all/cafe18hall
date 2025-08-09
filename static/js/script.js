document.addEventListener("DOMContentLoaded", () => {
  const fixedScoreboardBody = document.getElementById("fixed-scoreboard-body");
  const scrollableScoreboardBody = document.getElementById(
    "scrollable-scoreboard-body"
  );

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
    // Find the closest editable div, which could be the target itself or a child of the cell
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
      cell.textContent = newValue || "0"; // Restore 0 if empty
      cell.contentEditable = wasEditable; // Restore original state
      if (input.parentNode) {
        input.remove();
      }

      const { scrollableRow, fixedRow } = getAssociatedRows(cell);
      if (scrollableRow && fixedRow) {
        updateTotalScore(scrollableRow, fixedRow);
        synchronizeRowHeights();
      }
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
    }
  });

  // Initial setup
  const allScrollablePlayerRows =
    scrollableScoreboardBody.querySelectorAll(".player-row");
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
      this.textContent = "";      
      this.focus();      
    });

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
