/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

		document.body.innerHTML = '<div id="root"></div>';
		router();
		const root = document.getElementById("root");
		root.innerHTML = NewBillUI();
		window.onNavigate(ROUTES_PATH.NewBill);
	});

	describe("When I am on NewBill Page", () => {
		let newBillInstance;

		beforeEach(() => {
			newBillInstance = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});
		});

		test("Should render the form with data-testid='form-new-bill'", async () => {
			await waitFor(() => {
				const form = screen.getByTestId("form-new-bill");
				expect(form).toBeInTheDocument();
			});
		});

		test("Should allow adding a valid file", async () => {
			const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
			const inputFile = screen.getByTestId("file");
			inputFile.addEventListener("change", handleChangeFile);

			fireEvent.change(inputFile, {
				target: {
					files: [new File(["test.jpg"], "test.jpg", { type: "image/jpeg" })],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
		});

		test("Should show an error when uploading an invalid file type", async () => {
			const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
			const inputFile = screen.getByTestId("file");
			inputFile.addEventListener("change", handleChangeFile);

			fireEvent.change(inputFile, {
				target: {
					files: [
						new File(["test.pdf"], "test.pdf", { type: "application/pdf" }),
					],
				},
			});

			const errorMsgs = screen.queryAllByText(
				"Seuls les fichiers JPG, JPEG et PNG sont autorisés."
			);
			expect(handleChangeFile).toHaveBeenCalled();
			expect(inputFile.value).toBe("");
		});
	});

	describe("When I submit the form on NewBill Page", () => {
		beforeEach(() => {
			jest.spyOn(mockStore, "bills");
		});

		test("Should call API when form is submitted", () => {
			const newBillInstance = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});
			const handleSubmit = jest.fn(newBillInstance.handleSubmit);
			const form = screen.getByTestId("form-new-bill");
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
			expect(mockStore.bills).toHaveBeenCalled();
		});
	});

	describe("When an API error occurs", () => {
		let consoleSpy;

		beforeEach(() => {
			document.body.innerHTML = NewBillUI();
			window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

			consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleSpy.mockRestore();
		});

		test("Should handle 404 error gracefully", async () => {
			mockStore.bills.mockImplementationOnce(() => ({
				update: jest.fn(() => Promise.reject(new Error("404"))),
			}));

			const newBillInstance = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn((e) => newBillInstance.handleSubmit(e));
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);

			await waitFor(() => {
				expect(handleSubmit).toHaveBeenCalled();
				expect(consoleSpy).toHaveBeenCalledWith(new Error("404"));
			});
		});

		test("Should handle 500 error gracefully", async () => {
			mockStore.bills.mockImplementationOnce(() => ({
				update: jest.fn(() => Promise.reject(new Error("500"))),
			}));

			const newBillInstance = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn((e) => newBillInstance.handleSubmit(e));
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);

			await waitFor(() => {
				expect(handleSubmit).toHaveBeenCalled();
				expect(consoleSpy).toHaveBeenCalledWith(new Error("500"));
			});
		});
	});
});
