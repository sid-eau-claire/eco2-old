const accessCodeEmailContent = (codeString) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #1C2434;
            color: #CDB95E;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            background-color: #22c55e;
            color: #1C2434;
            padding: 10px;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to EAU CLAIRE ONE</h1>
        </div>
        <div class="content">
            <p>To continue accessing your account, please verify your email address.</p>
            <a href="#" class="button">Verification code: ${codeString}</a>
            <p>If you did not sign up for this account, you can ignore this email, and the account will be deactivated.</p>
        </div>
        <div class="footer">
            <p>Thank you for using our service!</p>
        </div>
    </div>
</body>
</html>
`;
module.exports = { accessCodeEmailContent };
