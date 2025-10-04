import reportWebVitals from "../reportWebVitals";

// mock web-vitals
jest.mock("web-vitals", () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

describe("reportWebVitals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls all web-vitals functions when given a valid onPerfEntry", async () => {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import("web-vitals");
    const mockEntryFn = jest.fn();

    await reportWebVitals(mockEntryFn);

    expect(getCLS).toHaveBeenCalledWith(mockEntryFn);
    expect(getFID).toHaveBeenCalledWith(mockEntryFn);
    expect(getFCP).toHaveBeenCalledWith(mockEntryFn);
    expect(getLCP).toHaveBeenCalledWith(mockEntryFn);
    expect(getTTFB).toHaveBeenCalledWith(mockEntryFn);
  });

  test("does nothing if onPerfEntry is not a function", async () => {
    await reportWebVitals(undefined);
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import("web-vitals");

    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
    expect(getFCP).not.toHaveBeenCalled();
    expect(getLCP).not.toHaveBeenCalled();
    expect(getTTFB).not.toHaveBeenCalled();
  });
});
