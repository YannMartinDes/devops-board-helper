// ==UserScript==
// @name         Filter Keyword Arrow Inserter
// @namespace    http://tampermonkey.net/
// @version      2025-10-17
// @description  Use < and > arrows to insert people into Azure Boards filter input directly when clicked
// @author       YannMartinDes
// @match        https://dev.azure.com/rndexperience/RnDExperienceV4/_boards/board/t/Contributors/Backlog%20items*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=azure.com
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	const words = [
		"Yohann",
		"Yann",
		"Loic",
		"Florian",
		"Johann",
		"Leo",
		"Nicolas T",
		"Nassim",
		"Marine C",
		"Manon",
		"Marine G",
	]; // 👉 Customize this list
	let currentIndex = 0;

	function insertWord(word) {
		const input = document.querySelector(
			'input[aria-label="Filter by keyword"]'
		);
		if (input) {
			input.focus();
			// select existing content so execCommand replaces instead of appending
			try {
				input.select();
			} catch (e) {
				// some inputs may not support select(); fallback: set value to empty
				input.value = "";
			}
			// use execCommand as you wanted (some environments still support it)
			document.execCommand("insertText", false, word);
			// leave caret at end (optional): set selection range after insertion
			try {
				const pos = input.value.length;
				input.setSelectionRange(pos, pos);
			} catch (e) {
				// ignore if not supported
			}
		} else {
			console.warn("Filter input not found!");
		}
	}

	function addArrowButtons() {
		const filterBar = document.getElementById("__bolt-filter-bar-0");
		if (!filterBar) return;
		if (document.getElementById("arrowInsertContainer")) return;

		// Create container
		const container = document.createElement("div");
		container.id = "arrowInsertContainer";
		container.style.display = "flex";
		container.style.alignItems = "center";
		container.style.gap = "8px";
		container.style.marginLeft = "10px";

		// Create buttons
		const prevBtn = document.createElement("button");
		const nextBtn = document.createElement("button");

		prevBtn.textContent = "<";
		nextBtn.textContent = ">";

		[prevBtn, nextBtn].forEach((btn) => {
			btn.style.padding = "5px 10px";
			btn.style.cursor = "pointer";
		});

		// Behavior: insert current word, then update index for next click
		const updateWord = (direction) => {
			// Insert the current word first
			insertWord(words[currentIndex]);

			// Then update index so next click moves along the list
			if (direction === "prev") {
				currentIndex = (currentIndex - 1 + words.length) % words.length;
			} else {
				currentIndex = (currentIndex + 1) % words.length;
			}
		};

		prevBtn.addEventListener("click", () => updateWord("prev"));
		nextBtn.addEventListener("click", () => updateWord("next"));

		container.appendChild(prevBtn);
		container.appendChild(nextBtn);
		filterBar.appendChild(container);
	}

	// Wait for Azure Boards to finish loading
	const observer = new MutationObserver(() => {
		const filterBar = document.getElementById("__bolt-filter-bar-0");
		if (filterBar) {
			addArrowButtons();
			observer.disconnect();
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
})();
