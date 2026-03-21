1. otp_url = https://script.google.com/macros/s/AKfycbwVaewijYkVjInBkoLBWXy5c-FYSWJqc4BR0URsNO1Pu_wlDH6XwpSPkgRS1diVBbd07w/exec
   this is otp url google appscript deployed , once the user requests for otp , we will call this url with email,name, otp as query params and this will send the otp to the user via gmail

2. Postman automation assets:

- Collection JSON: docs/auth-service.collection.json
- Test case guide: docs/postman-test-cases.md

3. OTP state storage:

- OTP challenges are stored in Upstash Redis via REDIS_URL env variable.
- TTL is 5 minutes and OTP is single-use.
