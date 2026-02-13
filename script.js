"use strict";

// Initialization
const container = document.querySelector(".tic-tac-toe-container");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const darkModeBtn = document.getElementById("dark-mode-toggle");
const DARK_MODE_KEY = "ultimate-tic-tac-toe-dark-mode";

const boardEls = Array.from(document.querySelectorAll(".big-cell"));
const cellElsByBoard = boardEls.map((boardEl, boardIndex) => {
	const cells = Array.from(boardEl.children);
	cells.forEach((cellEl, cellIndex) => {
		if (!cellEl.dataset.board) cellEl.dataset.board = String(boardIndex);
		if (!cellEl.dataset.cell) cellEl.dataset.cell = String(cellIndex);
	});
	return cells;
});

const makeEmptyBoard = () => Array.from({ length: 9 }, () => null);

let boards = Array.from({ length: 9 }, makeEmptyBoard);
let currentPlayer = "X";
let activeBoard = null;
let smallBoardWinners = Array.from({ length: 9 }, () => null);
let gameWinner = null;
let winningLine = null;

// Event listeners
if (container) {
	container.addEventListener("click", handleCellClick);
}

if (resetBtn) {
	resetBtn.addEventListener("click", resetGame);
}

if (darkModeBtn) {
	darkModeBtn.addEventListener("click", toggleDarkMode);
}

initializeTheme();

updateUI();

// Game logic
function handleCellClick(event) {
	const target = event.target;
	if (!(target instanceof Element)) return;
	const cellEl = target.closest(".big-cell > div");
	if (!(cellEl instanceof HTMLElement)) return;
	const { board: boardIndexStr, cell: cellIndexStr } = cellEl.dataset;
	if (boardIndexStr === undefined || cellIndexStr === undefined) return;

	const boardIndex = Number(boardIndexStr);
	const cellIndex = Number(cellIndexStr);

	if (gameWinner) return;
	if (Number.isNaN(boardIndex) || Number.isNaN(cellIndex)) return;
	if (!isMoveAllowed(boardIndex, cellIndex)) return;

	boards[boardIndex][cellIndex] = currentPlayer;
	const boardWinner = checkSmallBoardWin(boardIndex);
	if (boardWinner) {
		smallBoardWinners[boardIndex] = boardWinner;
	} else if (isBoardFull(boards[boardIndex])) {
		smallBoardWinners[boardIndex] = "D";
	}

	const mainResult = checkMainBoardWin();
	gameWinner = mainResult.winner;
	winningLine = mainResult.line;

	if (!gameWinner && isBoardFull(smallBoardWinners)) {
		gameWinner = "D";
		winningLine = null;
	}

	const nextBoard = cellIndex;
	if (smallBoardWinners[nextBoard]) {
		activeBoard = null;
	} else {
		activeBoard = nextBoard;
	}

	if (!gameWinner) {
		currentPlayer = currentPlayer === "X" ? "O" : "X";
	}

	updateUI();
}

function isMoveAllowed(boardIndex, cellIndex) {
	if (boards[boardIndex][cellIndex] !== null) return false;
	if (smallBoardWinners[boardIndex]) return false;
	if (activeBoard !== null && activeBoard !== boardIndex) return false;
	return true;
}

function checkWin(boardArray) {
	const wins = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];

	for (const [a, b, c] of wins) {
		if (boardArray[a] && boardArray[a] === boardArray[b] && boardArray[a] === boardArray[c]) {
			return boardArray[a];
		}
	}

	return null;
}

function getWinningLine(boardArray) {
	const wins = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];

	for (const line of wins) {
		const [a, b, c] = line;
		if (boardArray[a] && boardArray[a] === boardArray[b] && boardArray[a] === boardArray[c]) {
			return line;
		}
	}

	return null;
}

function checkSmallBoardWin(boardIndex) {
	return checkWin(boards[boardIndex]);
}

function checkMainBoardWin() {
	const winnersForCheck = smallBoardWinners.map((winner) => (winner === "D" ? null : winner));
	const line = getWinningLine(winnersForCheck);
	return {
		winner: line ? winnersForCheck[line[0]] : null,
		line
	};
}

function isBoardFull(boardArray) {
	return boardArray.every((cell) => cell !== null);
}

function updateUI() {
	boardEls.forEach((boardEl, boardIndex) => {
		const winner = smallBoardWinners[boardIndex];
		const isMainWin = (gameWinner === "X" || gameWinner === "O")
			&& Boolean(winningLine && winningLine.includes(boardIndex));
		const isActive = (gameWinner === "X" || gameWinner === "O")
			? isMainWin
			: gameWinner === "D"
				? true
				: activeBoard === null
					? !smallBoardWinners[boardIndex]
					: activeBoard === boardIndex;
		boardEl.classList.toggle("active-board", isActive);
		boardEl.classList.toggle("inactive-board", !isActive);
		boardEl.classList.toggle("winning-board", isMainWin);
		boardEl.classList.toggle("won-x", winner === "X");
		boardEl.classList.toggle("won-o", winner === "O");
		boardEl.classList.toggle("draw", winner === "D");
		if (gameWinner === "X" || gameWinner === "O") {
			boardEl.dataset.mainWinner = gameWinner;
		} else {
			delete boardEl.dataset.mainWinner;
		}

		cellElsByBoard[boardIndex].forEach((cellEl, cellIndex) => {
			cellEl.textContent = boards[boardIndex][cellIndex] ?? "";
		});
	});

	if (!statusEl) return;

	if (gameWinner === "X" || gameWinner === "O") {
		statusEl.textContent = `Player ${gameWinner} wins the game!`;
	} else if (gameWinner === "D") {
		statusEl.textContent = "The game is a draw.";
	} else if (activeBoard === null) {
		statusEl.textContent = `Player ${currentPlayer}, play in any open board.`;
	} else {
		statusEl.textContent = `Player ${currentPlayer}, play in board ${activeBoard + 1}.`;
	}
}

function resetGame() {
	boards = Array.from({ length: 9 }, makeEmptyBoard);
	currentPlayer = "X";
	activeBoard = null;
	smallBoardWinners = Array.from({ length: 9 }, () => null);
	gameWinner = null;
	winningLine = null;
	updateUI();
}

function initializeTheme() {
	const savedPreference = localStorage.getItem(DARK_MODE_KEY);
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const shouldUseDark = savedPreference === null ? prefersDark : savedPreference === "true";
	applyTheme(shouldUseDark);
}

function toggleDarkMode() {
	const isDarkMode = document.body.classList.toggle("dark-mode");
	localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
	updateThemeButton(isDarkMode);
}

function applyTheme(isDarkMode) {
	document.body.classList.toggle("dark-mode", isDarkMode);
	updateThemeButton(isDarkMode);
}

function updateThemeButton(isDarkMode) {
	if (!darkModeBtn) return;
	darkModeBtn.setAttribute("aria-pressed", String(isDarkMode));
	darkModeBtn.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
}
