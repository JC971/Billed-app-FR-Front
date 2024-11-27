/**
 * @jest-environment jsdom
 */
/*
import '@testing-library/jest-dom';
import {screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            expect(Array.from(windowIcon.classList)).toContain("active-icon");
        });

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });

        test("Then a new bill button should be displayed", async () => {
            const root = document.getElementById("root") || document.createElement("div");
            if (!document.getElementById("root")) {
                root.setAttribute("id", "root");
                document.body.append(root);
            }
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            await waitFor(() => screen.getByTestId("btn-new-bill"));
            const newBillButton = screen.getByTestId("btn-new-bill");
        });
        
		test("then in the vertical layout should be layout-title ")
    });
});
*/


/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="root"></div>';
      router();
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@example.com' }));
      const root = document.getElementById('root');
      root.innerHTML = BillsUI({ data: bills });
      new Bills({
        document,
        onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        },
        localStorage: window.localStorage
      });
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => expect(screen.getByTestId('icon-window')).toBeTruthy());
      const icon = screen.getByTestId("icon-window");
      expect(icon.classList).toContain("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.textContent);
      const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
      expect(dates).toEqual(sortedDates);
    });

    test("Then the layout-title in the vertical layout should be displayed", () => {
      expect(screen.getByTestId('layout-title')).toBeInTheDocument();
      expect(screen.getByTestId('layout-title').textContent).toContain('Billed');
    });
  });
});

