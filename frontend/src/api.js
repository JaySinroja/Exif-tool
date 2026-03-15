/**
 * api.js — Central API configuration
 *
 * HOW TO CONFIGURE:
 * -------------------------------------------------
 * Case 1: Running React + Flask both on the same Windows machine (most common)
 *   → Keep as-is: API_BASE = "http://localhost:5000"
 *
 * Case 2: Running React in WSL2 / different network than Flask
 *   → Replace "localhost" with your Windows machine's IP (shown in Flask startup)
 *   → Example: API_BASE = "http://10.153.121.16:5000"
 *
 * Case 3: Running on a remote server
 *   → Replace with the server's IP or domain
 * -------------------------------------------------
 */
export const API_BASE = "http://localhost:5000";
