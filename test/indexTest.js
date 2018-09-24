import * as lib from "../dist/npm"

test("export something", () => {
  expect(Object.keys(lib).length).toBeGreaterThan(0)
})
