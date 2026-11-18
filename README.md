# MediCare HMS — Frontend

React and Vite frontend for the MediCare hospital-management prototype.

## Local setup

1. Install dependencies with `npm install`.
2. Configure `VITE_API_BASE_URL` in the frontend environment to the backend origin, without a trailing slash or `/api`. Leave it empty for local development to use the Vite proxy.
3. Start with `npm run dev`.
4. Create a production bundle with `npm run build`.

## Environment

`VITE_API_BASE_URL` is public browser configuration, not a place for private credentials.

## Security status

This is a demonstration prototype. The companion backend currently uses unsigned demo authentication and mock payment values. Do not connect real patient data, credentials or payment accounts until server-side authentication, role authorization, audit logging and payment verification are properly implemented.

## Related repository

[MediCare HMS backend](https://github.com/Nashid-k/medicare_hms_backend)
