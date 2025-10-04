import "@testing-library/jest-dom";
import axios from "axios";

// Mock window.alert, confirm, and prompt
beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn();
  window.prompt = jest.fn();
});

// Mock axios globally (so no network calls hit 127.0.0.1:5000)
jest.mock("axios");
