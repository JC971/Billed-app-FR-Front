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
    beforeEach(async () => {
      await waitFor(() => expect(screen.getByTestId("form-new-bill")).toBeInTheDocument());
    });

    test("Then mail icon on vertical layout should be highlighted", async () => {
      const icon = await screen.findByTestId("icon-mail");
      expect(icon).toHaveClass("active-icon");
    });

    test("Then the form should be rendered", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeInTheDocument();
    });

    test("Then I can add a file", () => {
      const newBillInstance = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      fireEvent.change(inputFile, {
        target: {
          files: [new File(["document.jpg"], "document.jpg", { type: "image/jpeg" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
});

describe("When I am on NewBill Page and submit the form", () => {
  beforeEach(async () => {
    jest.spyOn(mockStore, "bills");
    await waitFor(() => expect(screen.getByTestId("form-new-bill")).toBeInTheDocument());
  });

  test("user submits a valid form and API update is called for bills", () => {
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
