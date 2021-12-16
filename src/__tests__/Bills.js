import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import firebase from "../__mocks__/firebase.js"
import Firestore from "../app/Firestore.js"
import Router from "../app/Router"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // const html = BillsUI({ data: [bills] })
      // document.body.innerHTML = html
      // //to-do write expect expression
      jest.mock("../app/Firestore")
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          email: "test@test.com",
          type: "Employee",
        }),
      )
      const pathname = ROUTES_PATH["Bills"]
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId("icon-window").classList).toContain("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByTestId("bill-date").map((a) => a.getAttribute("value"))
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("Given employee  enter  his email and his  password", () => {
    describe("When email and password are good", () => {
      test("Then loading page Bills", () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText("Loading...")).toBeTruthy()
      })

      describe("when email and password are wrong", () => {
        test("Then Error page  is loaded ", () => {
          const html = BillsUI({ error: true })
          document.body.innerHTML = html
          expect(screen.getAllByText("Erreur")).toBeTruthy()
        })
      })
    })
  })
})

describe("When I click on button 'Nouvelle note de frais'", () => {
  test("Then the page new bill should be  open", () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const bill = new Bills({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    })
    const buttonNewBill = screen.getByTestId("btn-new-bill")
    const mockFunction = jest.fn(bill.handleClickNewBill)
    buttonNewBill.addEventListener("click", mockFunction)
    fireEvent.click(buttonNewBill)
    expect(mockFunction).toHaveBeenCalled()
  })
})
describe("When I click on the eye icon", () => {
  test("Then modal should be open ", () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const bill = new Bills({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    })
    $.fn.modal = jest.fn()

    const eyeIcon = screen.getAllByTestId("icon-eye")[0]
    const modal = document.getElementById("modaleFile")

    const mockFunction = jest.fn(bill.handleClickIconEye(eyeIcon))
    eyeIcon.addEventListener("click", mockFunction)
    fireEvent.click(eyeIcon)

    expect(mockFunction).toHaveBeenCalled()
    expect(modal).toBeTruthy()
  })
})

//  Test d'integration GET Bills

describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")))
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")))
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
