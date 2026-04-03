/**
 * Send OTP Verification Email
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - Recipient's name
 * @param {string} otp - 6-digit OTP code
 */

/**
 * Handle POST requests to the web app
 * This function is called when external applications send data to this script
 * @param {object} e - Event object containing POST data
 * @return {object} JSON response
 */
function doPost(e) {
  try {
    // Parse incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Extract parameters
    const userEmail = data.email;
    const userName = data.name || 'User';
    const otp = data.otp;
    
    // Validate required parameters
    if (!userEmail || !otp) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Missing required parameters: email and otp are required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Send OTP email
    const result = sendOTPEmail(userEmail, userName, otp);
    
    // Store OTP if email sent successfully
    if (result.success) {
      storeOTP(userEmail, otp);
    }
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error processing request: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Handle GET requests (optional - for testing)
 * @param {object} e - Event object
 * @return {object} HTML response
 */
function doGet(e) {
  return ContentService.createTextOutput(
    'SUVIDHA-KIOSK OTP Service is running. Use POST requests to send OTPs.'
  ).setMimeType(ContentService.MimeType.TEXT);
}
function sendOTPEmail(userEmail, userName, otp) {
  try {
    // Validate inputs
    if (!userEmail || !userName || !otp) {
      throw new Error('Missing required parameters');
    }
    
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('OTP must be a 6-digit number');
    }
    
    // Email subject
    const subject = 'SUVIDHA-KIOSK - Your OTP Verification Code';
    
    // HTML email body with professional solid colors
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f7fa;
          padding: 20px;
          line-height: 1.6;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #1a73e8;
          padding: 35px 30px;
          text-align: center;
        }
        .brand-container {
          margin-bottom: 20px;
        }
        .brand-name {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 0;
          text-transform: uppercase;
        }
        .brand-tagline {
          color: #e8f0fe;
          font-size: 13px;
          margin-top: 5px;
          letter-spacing: 0.5px;
        }
        .header-divider {
          width: 60px;
          height: 3px;
          background-color: #ffffff;
          margin: 20px auto;
        }
        .header-icon {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 50%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        .header h2 {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          margin-top: 15px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #202124;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 15px;
          color: #5f6368;
          margin-bottom: 30px;
        }
        .otp-container {
          background-color: #f8f9fa;
          border: 2px solid #e8eaed;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-label {
          color: #5f6368;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 700;
          color: #1a73e8;
          letter-spacing: 12px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
        }
        .otp-divider {
          width: 60px;
          height: 3px;
          background-color: #1a73e8;
          margin: 20px auto;
        }
        .validity-box {
          background-color: #e8f5e9;
          border-left: 4px solid #34a853;
          padding: 16px 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .validity-box p {
          margin: 0;
          color: #1e8e3e;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        .validity-icon {
          margin-right: 10px;
          font-size: 18px;
        }
        .warning-box {
          background-color: #fef7e0;
          border: 2px solid #f9ab00;
          border-radius: 8px;
          padding: 24px;
          margin: 30px 0;
        }
        .warning-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .warning-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        .warning-box h3 {
          color: #ea8600;
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .warning-box p {
          margin: 10px 0;
          color: #3c4043;
          font-size: 14px;
        }
        .warning-box strong {
          color: #ea8600;
          font-weight: 600;
        }
        .warning-actions {
          margin-top: 15px;
          padding-left: 0;
          list-style: none;
        }
        .warning-actions li {
          padding: 8px 0 8px 25px;
          position: relative;
          color: #3c4043;
          font-size: 14px;
        }
        .warning-actions li:before {
          content: "•";
          position: absolute;
          left: 10px;
          color: #ea8600;
          font-weight: bold;
        }
        .security-tips {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .security-tips h4 {
          color: #202124;
          font-size: 15px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .security-tips ul {
          padding-left: 0;
          list-style: none;
        }
        .security-tips li {
          padding: 8px 0 8px 30px;
          position: relative;
          color: #5f6368;
          font-size: 14px;
        }
        .security-tips li:before {
          content: "✓";
          position: absolute;
          left: 10px;
          color: #34a853;
          font-weight: bold;
        }
        .info-box {
          background-color: #e8f0fe;
          border-left: 4px solid #1a73e8;
          padding: 16px 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 0;
          color: #185abc;
          font-size: 14px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e8eaed;
        }
        .footer-brand {
          color: #1a73e8;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }
        .footer p {
          margin: 8px 0;
          color: #5f6368;
          font-size: 13px;
        }
        .footer-divider {
          width: 40px;
          height: 2px;
          background-color: #dadce0;
          margin: 20px auto;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 10px;
          }
          .content {
            padding: 30px 20px;
          }
          .otp-code {
            font-size: 32px;
            letter-spacing: 8px;
          }
          .header {
            padding: 30px 20px;
          }
          .brand-name {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="brand-container">
            <h1 class="brand-name">SUVIDHA-KIOSK</h1>
            <p class="brand-tagline">Secure. Simple. Swift.</p>
          </div>
          <div class="header-divider"></div>
          <div class="header-icon">🔐</div>
          <h2>Verification Code</h2>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <div class="greeting">
            Hello ${userName},
          </div>
          
          <div class="message">
            We received a request to verify your SUVIDHA-KIOSK account. Use the verification code below to complete the process. This code is unique to your session and will expire shortly.
          </div>
          
          <!-- OTP Display -->
          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-divider"></div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <!-- Validity Info -->
          <div class="validity-box">
            <p><span class="validity-icon">⏱</span> <strong>This code expires in 10 minutes.</strong> Please use it promptly.</p>
          </div>
          
          <!-- Security Warning -->
          <div class="warning-box">
            <div class="warning-header">
              <span class="warning-icon">⚠️</span>
              <h3>Did You Request This Code?</h3>
            </div>
            <p><strong>If you did NOT request this verification code, take action immediately:</strong></p>
            <ul class="warning-actions">
              <li>Do not share this code with anyone</li>
              <li>Report this to SUVIDHA-KIOSK security team right away</li>
              <li>Change your account password immediately</li>
              <li>Review your recent account activity</li>
            </ul>
            <p style="margin-top: 15px; font-size: 13px; color: #5f6368;">
              Someone may be attempting unauthorized access to your SUVIDHA-KIOSK account.
            </p>
          </div>
          
          <!-- Security Tips -->
          <div class="security-tips">
            <h4>🛡️ Security Best Practices</h4>
            <ul>
              <li>Never share your verification code with anyone, including SUVIDHA-KIOSK support team</li>
              <li>We will never ask for your code via phone, email, or text message</li>
              <li>Always verify you're on the official SUVIDHA-KIOSK platform</li>
              <li>Be cautious of phishing attempts asking for your credentials</li>
            </ul>
          </div>
          
          <!-- Additional Info -->
          <div class="info-box">
            <p>💡 <strong>Tip:</strong> Enable two-factor authentication for an extra layer of security on your SUVIDHA-KIOSK account.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-brand">SUVIDHA-KIOSK</div>
          <p style="font-weight: 500; color: #3c4043;">Need Help?</p>
          <p>If you have any questions or concerns, please contact our support team.</p>
          <div class="footer-divider"></div>
          <p style="font-size: 12px; color: #80868b;">
            This is an automated message from SUVIDHA-KIOSK. Please do not reply to this email.
          </p>
          <p style="font-size: 12px; color: #80868b; margin-top: 15px;">
            © ${new Date().getFullYear()} SUVIDHA-KIOSK. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Plain text version (fallback)
    const plainBody = `
╔════════════════════════════════════════╗
║         SUVIDHA-KIOSK                  ║
║    Secure. Simple. Swift.              ║
╚════════════════════════════════════════╝

Hello ${userName},

YOUR VERIFICATION CODE: ${otp}

This code is valid for 10 minutes.

⚠️ IMPORTANT SECURITY ALERT

If you did NOT request this verification code:
- Do not share this code with anyone
- Report this to SUVIDHA-KIOSK security team immediately
- Change your account password right away
- Review your recent account activity

Someone may be attempting unauthorized access to your SUVIDHA-KIOSK account.

SECURITY BEST PRACTICES:
✓ Never share your verification code with anyone
✓ We will never ask for your code via phone or email
✓ Always verify you're on the official SUVIDHA-KIOSK platform
✓ Be cautious of phishing attempts

Need help? Contact our support team.

This is an automated message from SUVIDHA-KIOSK.
Please do not reply to this email.

© ${new Date().getFullYear()} SUVIDHA-KIOSK. All rights reserved.
    `;
    
    // Send the email
    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    
    Logger.log(`OTP email sent successfully to ${userEmail} from SUVIDHA-KIOSK`);
    return {
      success: true,
      message: 'OTP email sent successfully from SUVIDHA-KIOSK',
      recipient: userEmail
    };
    
  } catch (error) {
    Logger.log(`Error sending OTP email: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
}


/**
 * Example usage / Test function
 */
function testSendOTP() {
  const userEmail = 'gurunadharao5718@gmail.com ';  // Replace with actual email
  const userName = 'John Doe';
  const otp = '123456';  // In production, generate this randomly
  
  const result = sendOTPEmail(userEmail, userName, otp);
  Logger.log(result);
}


/**
 * Generate a random 6-digit OTP
 * @return {string} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


/**
 * Complete example with OTP generation for SUVIDHA-KIOSK
 */
function sendOTPToUser(userEmail, userName) {
  const otp = generateOTP();
  const result = sendOTPEmail(userEmail, userName, otp);
  
  if (result.success) {
    // Store OTP with timestamp for validation
    storeOTP(userEmail, otp);
  }
  
  return result;
}


/**
 * Store OTP for validation (using Properties Service)
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 */
function storeOTP(email, otp) {
  const properties = PropertiesService.getScriptProperties();
  const expiryTime = new Date().getTime() + (10 * 60 * 1000); // 10 minutes
  
  properties.setProperty(email, JSON.stringify({
    otp: otp,
    expiry: expiryTime,
    application: 'SUVIDHA-KIOSK'
  }));
  
  Logger.log(`OTP stored for ${email} in SUVIDHA-KIOSK system`);
}


/**
 * Verify OTP for SUVIDHA-KIOSK
 * @param {string} email - User email
 * @param {string} inputOTP - OTP entered by user
 * @return {object} Verification result
 */
function verifyOTP(email, inputOTP) {
  const properties = PropertiesService.getScriptProperties();
  const storedData = properties.getProperty(email);
  
  if (!storedData) {
    return { 
      valid: false, 
      message: 'No OTP found for this email in SUVIDHA-KIOSK system' 
    };
  }
  
  const data = JSON.parse(storedData);
  const currentTime = new Date().getTime();
  
  if (currentTime > data.expiry) {
    properties.deleteProperty(email);
    return { 
      valid: false, 
      message: 'OTP has expired. Please request a new one.' 
    };
  }
  
  if (data.otp === inputOTP) {
    properties.deleteProperty(email);
    Logger.log(`OTP verified successfully for ${email} in SUVIDHA-KIOSK`);
    return { 
      valid: true, 
      message: 'OTP verified successfully',
      application: 'SUVIDHA-KIOSK'
    };
  }
  
  return { 
    valid: false, 
    message: 'Invalid OTP. Please check and try again.' 
  };
}


/**
 * Send OTP and return the generated code (for testing)
 * @param {string} userEmail - Recipient's email
 * @param {string} userName - Recipient's name
 * @return {object} Result with OTP code
 */
function sendOTPWithResponse(userEmail, userName) {
  const otp = generateOTP();
  const result = sendOTPEmail(userEmail, userName, otp);
  
  if (result.success) {
    storeOTP(userEmail, otp);
    result.otp = otp; // Include OTP in response for testing
    result.application = 'SUVIDHA-KIOSK';
  }
  
  return result;
}


/**
 * Resend OTP to user
 * @param {string} userEmail - Recipient's email
 * @param {string} userName - Recipient's name
 * @return {object} Result
 */
function resendOTP(userEmail, userName) {
  // Delete old OTP if exists
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty(userEmail);
  
  // Send new OTP
  return sendOTPToUser(userEmail, userName);
}