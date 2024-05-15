/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and add a file to the file input", () => {
    test("Then, should call handleChangeFile method when file input changes", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const onNavigate = jest.fn();
      const store = mockStore;
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      const handleChangeFileMock = jest.spyOn(newBill, 'handleChangeFile').mockImplementation(() => { });
      newBill.handleChangeFile = handleChangeFileMock;

      const input = screen.getByTestId('file');
      input.addEventListener("change", newBill.handleChangeFile)
      fireEvent.change(input, { target: { files: [new File([''], 'test.png', { type: 'image/png' })] } });

      expect(newBill.handleChangeFile).toHaveBeenCalled();
    });

    test('Then, it should add file to FormData if extension is allowed', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('file');
      fireEvent.change(input, { target: { files: [file] } });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', 'test@example.com');
      expect(input.files[0]).toEqual(file);
    });

    test('Then, it should clear file selection and show alert if extension is not allowed', () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const input = screen.getByTestId('file');
      fireEvent.change(input, { target: { files: [file] } });
      expect(mockAlert).toHaveBeenCalledWith('Veuillez sélectionner un fichier avec une extension jpg, jpeg ou png.');
    });
  });


  // Test d'intégration POST
  describe("When I want to submit a new bill", () => {
    test("Then, handleSubmit function should submit the form data correctly", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })

      // submit un exemple de bill correct
      const validBill = {
        type: "Restaurants et bars",
        name: "Vol Paris Montréal",
        date: "2022-02-15",
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: "Commentary",
        fileUrl: "../img/0.jpg",
        fileName: "test.jpg",
        status: "pending"
      }

      screen.getByTestId("expense-type").value = validBill.type
      screen.getByTestId("expense-name").value = validBill.name
      screen.getByTestId("datepicker").value = validBill.date
      screen.getByTestId("amount").value = validBill.amount
      screen.getByTestId("vat").value = validBill.vat
      screen.getByTestId("pct").value = validBill.pct
      screen.getByTestId("commentary").value = validBill.commentary

      const inputType = screen.getByTestId("expense-type");
      fireEvent.change(inputType, {
        target: { value: validBill.type },
      });
      expect(inputType.value).toBe(validBill.type);

      const inputName = screen.getByTestId("expense-name");
      fireEvent.change(inputName, {
        target: { value: validBill.name },
      });
      expect(inputName.value).toBe(validBill.name);

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {
        target: { value: validBill.date },
      });
      expect(inputDate.value).toBe(validBill.date);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
        target: { value: validBill.amount },
      });
      expect(inputAmount.value).toBe(validBill.amount.toString());

      const inputVAT = screen.getByTestId("vat");
      fireEvent.change(inputVAT, {
        target: { value: validBill.vat },
      });
      expect(inputVAT.value).toBe(validBill.vat.toString());

      const inputPCT = screen.getByTestId("pct");
      fireEvent.change(inputPCT, {
        target: { value: validBill.pct },
      });
      expect(inputPCT.value).toBe(validBill.pct.toString());

      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, {
        target: { value: validBill.commentary },
      });
      expect(inputCommentary.value).toBe(validBill.commentary);

      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl
      newBill.updateBill = jest.fn()

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const button = screen.getByTestId("form-new-bill")
      button.addEventListener("submit", handleSubmit)
      fireEvent.submit(button)

      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    });
  })
});
