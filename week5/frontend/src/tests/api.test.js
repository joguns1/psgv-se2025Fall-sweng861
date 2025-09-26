import axios from "axios";
import api from "../api";

describe("API instance", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("uses the correct baseURL", () => {
    expect(api.defaults.baseURL).toBe("http://127.0.0.1:5000");
  });

  test("adds Authorization header when token exists", async () => {
    localStorage.setItem("token", "fake-token");

    const config = { headers: {} };
    // manually trigger the request interceptor
    const modifiedConfig = await api.interceptors.request.handlers[0].fulfilled(
      config
    );

    expect(modifiedConfig.headers.Authorization).toBe("Bearer fake-token");
  });

  test("does not add Authorization header if no token exists", async () => {
    const config = { headers: {} };
    const modifiedConfig = await api.interceptors.request.handlers[0].fulfilled(
      config
    );

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  test("sends request through axios with Authorization", async () => {
    localStorage.setItem("token", "fake-token");
    const mockResponse = { data: { ok: true } };

    jest.spyOn(axios, "get").mockResolvedValue(mockResponse);

    const res = await api.get("/covid");

    expect(axios.get).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/covid",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(res).toEqual(mockResponse);
  });

  test("attaches token to request headers", async () => {
    const mockToken = "fake-token";
    localStorage.setItem("token", mockToken);

    //mock the axios instance with interceptors
    const mockUse = jest.fn((cb) =>
      cb({ headers: {} }) // simulate interceptor adding header
    );
    axios.create.mockReturnValue({
      interceptors: { request: { use: mockUse } },
    });

    const instance = require("../api").default;

    expect(instance.interceptors.request.use).toBeDefined();
    expect(mockUse).toHaveBeenCalled();
  });
});
