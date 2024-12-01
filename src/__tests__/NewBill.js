/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		beforeEach(() => {
			document.body.innerHTML = '<div id="root"></div>';
			const rootDiv = document.getElementById("root");
			rootDiv.innerHTML = NewBillUI();
			localStorage.setItem(
				"user",
				JSON.stringify({ type: "Employee", email: "employee@example.com" })
			);
			router();
			window.onNavigate(ROUTES_PATH.NewBill);
		});

		afterEach(() => {
			document.body.innerHTML = "";
			localStorage.clear();
		});

		test("Then the newBill form should be displayed", () => {
			expect(screen.getByTestId("form-new-bill")).toBeInTheDocument();
		});

		test("When the form is submitted, handleSubmit should be called", () => {
			const newBill = new NewBill({
				document,
				onNavigate: (pathname) => {
					document.body.innerHTML = "";
					expect(pathname).toBe(ROUTES_PATH.Bills);
				},
				store: null,
				localStorage: window.localStorage,
			});

			const handleSubmitSpy = jest
				.spyOn(newBill, "handleSubmit")
				.mockImplementation((e) => e.preventDefault());
			const form = screen.getByTestId("form-new-bill");
			form.addEventListener("submit", newBill.handleSubmit);

			fireEvent.submit(form);

			expect(handleSubmitSpy).toHaveBeenCalled();
		});
	});
});


