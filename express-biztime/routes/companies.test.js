process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../app")

let db = require("../db")

let testCompany;

beforeEach(async () => {
    const result = await db.query(`INSERT into companies (code, name, description) VALUES ('fender', 'Fender', 'Makes Guitars') RETURNING code, name, description`);
    testCompany = result.rows[0]
})
afterEach(async () => {
    await db.query(`DELETE from companies`)
})

afterAll(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

// GET company list
describe ("GET /", () =>{
    testCompany("Get all companies", async () => {
        const response = await request(app).get("/companies");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "companies": [
                {code: "fender", description: "Make Guitars", name: "Fender"}
            ]
        })
    })
})

// GET specfic company
describe("GET /companies/:code", () => {
    testCompany("Get a company by code", async () => {
        const response = await request(app).get(`/companies/${testCompany.code}`)
        expect(response.statusCode).toBe(200)
        expect(response.body.company.code).toEqual(`${testCompany.code}`)
    })
    test("404 response for invalid company code", async () => {
        const response = await request(app).get(`companies/0`)
        expect(response.statusCode).toBe(404)
    })
})

//POST new company
describe("POST /", () => {
    test("creating a company", async () => {
        const response = await request.app("companies").send({
            name: "Ibanez",
            description: "Also make guitars"
        })
        expect(response.body).toEqual({
            "company": {code: 'ibanez', name: "Ibanez", description: "Also makes guitars"}
        })
    })
})



// delete a company
describe("DELETE /", () => {
    test("Deletes existing company", async () => {
        const response = await request(app).delete(`/companies/fender`)
        execpt(response.body).toEqual({
            status: "DELETED!"
        })
    })
    test("It should return 404 for no-such-comp", async function () {
        const response =await request(app).delete("/companies/blargh");

        expect(response.status).toEqual(404)
    })
})