import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"

beforeEach(() => {
  const html = NewBillUI()
  document.body.innerHTML = html
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill page should be rendered", () => {
      const el = screen.getByTestId("page-title")
      expect(el.textContent.trim()).toEqual("Envoyer une note de frais")
      //to-do write assertion
    })
  })
  describe("When I add image file", () => {
    test("Then the file is upload", async () => {
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

describe("Given I am on the NewBill Page and the form is completed", () => {
  describe("When I click on the Submit NewBill button", () => {
    test("Then the form should be submitted and I should be redirected to the Bills page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        }),
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firestore = null
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })
})

// test handleSubmit
describe("When I submit a valid bill", () => {
  test("Then a bill is created and i should be redirected to Bills page", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        email: "test@test.com",
      }),
    )

    const newBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage,
    })
    const submit = screen.getByTestId("form-new-bill")
    const bill = {
      type: "sante",
      name: "Bill",
      amount: 250,
      date: "2021-11-26",
      vat: 70,
      pct: 29,
      commentary: "C'est un test",
      fileUrl: "test.png",
      fileName: "test.png",
    }
    const handleSubmit = jest.fn(newBill.handleSubmit)
    newBill.createBill = (newBill) => newBill
    screen.getByTestId("expense-type").value = bill.type
    screen.getByTestId("expense-name").value = bill.name
    screen.getByTestId("amount").value = bill.amount
    screen.getByTestId("datepicker").value = bill.date
    screen.getByTestId("vat").value = bill.vat
    screen.getByTestId("pct").value = bill.pct
    screen.getByTestId("commentary").value = bill.commentary
    newBill.fileUrl = bill.fileUrl
    newBill.fileName = bill.fileName
    submit.addEventListener("submit", handleSubmit)
    fireEvent.submit(submit)
    expect(handleSubmit).toHaveBeenCalled()
    expect(screen.getByText("Mes notes de frais")).toBeTruthy()
  })
})

// test d'integration POST

describe("Given I am a user connected as an Employee", () => {
  describe("When I submit new bill", () => {
    test("post bill to mock API", async () => {
      const newBill = {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl":
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20,
      }

      const postSpy = jest.spyOn(firebase, "post")
      const postBill = await firebase.post(newBill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(postSpy).toReturn()
      expect(postBill.id).toMatch("47qAXb6fIm2zOKkLzMro")
    })
  })
})
