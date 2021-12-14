import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const el = screen.getByTestId("page-title")
      expect(el.textContent.trim()).toEqual("Envoyer une note de frais")
      //to-do write assertion
    })
  })
  describe("When I add image file", () => {
    test("Then the file is upload", async () => {
      window.localStorage = localStorageMock
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firestore = {
        storage: {
          ref: () => ({
            put: () =>
              Promise.resolve({
                ref: {
                  getDownloadURL: jest.fn(),
                },
              }),
          }),
        },
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File([""], "alev.png", { type: "image/png" })],
        },
      })
      const errorMessage = screen.getByTestId("error-msg")
      expect(handleChangeFile).toHaveBeenCalled()
      expect(errorMessage.style.display).toEqual("none")

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File([""], "alev.jpeg", { type: "image/jpeg" })],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByTestId("error-msg").style.display).toBe("none")

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File([""], "alev.jpg", { type: "image/jpg" })],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByTestId("error-msg").style.display).toBe("none")
    })
  })
})
