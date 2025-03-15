const admin = require("firebase-admin");

// NOTE: Please obtain the necessary credentials from ThefCraft and paste them into this file (and rename firebase.example.js to firebase.js).
// OR i will provide you firebase.js which you can paste in this dir
// For security reasons avoid uploading sensitive information to GitHub.


const getUserInfoFromMicrosoft = async (accessToken) => {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching user data from Microsoft Graph');
      }
      const userInfo = await response.json();
      // example
      // {
        // "businessPhones": [
            //  "+1 425 555 0109"
        //  ],
        //  "displayName": "Adele Vance",
        //  "givenName": "Adele",
        //  "jobTitle": "Retail Manager",
        //  "mail": "AdeleV@contoso.com",
        //  "mobilePhone": "+1 425 555 0109",
        //  "officeLocation": "18/2111",
        //  "preferredLanguage": "en-US",
        //  "surname": "Vance",
        //  "userPrincipalName": "AdeleV@contoso.com",
        //  "id": "87d349ed-44d7-43e1-9a83-5f2406dee5bd"
      // }
      return userInfo;
    } catch (error) {
      console.error(error);
      throw error;
    }
};

class Email {
  constructor(email) {
    this.email = email;
  }

  get username() {
    return this.email.split('@')[0];
  }

  get domain() {
    return this.email.split('@')[1];
  }
}

// Function to extract roll numbers
const extractRollNumbers = (data) => {
return data.map(user => {
  // Regex to match roll numbers in the format ####XX##
  const match = user.match(/\d{4}[a-z]{2}\d{2}/i); // Match pattern for roll number
  return match ? match[0] : null; // Return the roll number or null if not found
}).filter(Boolean); // Remove null values
};

class UtilsUser {
  constructor(email) {
    this.email = new Email(email);
    const username = this.email.username;
    this.rollno = extractRollNumbers([username])[0];
    // const pos = username.lastIndexOf('_');
    // this.name = username.slice(0, pos);
    // this.rollno = username.slice(pos + 1);  // Everything after the last underscore
  }

  get isValid(){
    return this.email.domain === 'iitp.ac.in'
  }

  get branch() {
    return this.rollno.slice(4, 6).toUpperCase(); // 2302mc05 => branch = MC
  }

  get year() {
    const yearIn = parseInt(this.rollno.slice(0, 2), 10);
    return yearIn;
  }
}

const serviceAccount = {
  projectId: "collabnest-cassiopiea",
  clientEmail: "firebase-adminsdk-fbsvc@collabnest-cassiopiea.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzxU/livfnnrQV\nwnD+7cqnneYHejxfP56WdsrJKg2M1EEJOmOov6jKg3cV1DfboMaMn1cYuy1T2R4n\n9s5r9AJ28l+UEI/n27iV3/iQWO1p1Vyy3PSyiQ6srsEDq2hkS/Bh2SMwP5lQH5BA\nZad2T5lQkfOmScPIJXxrfvgPWT48NhXaDjccNubaBrL0Qr+PBsKJSK06Zv4YWsuJ\nSuglsWiJ/f+GDMgaeth94pKDobyADkgk4tXYhihtxMM2jc4QKaS8f87wr9rLOae9\nMhNeJaukGgyXt4WJ86KySvNNL95/LmaahpxJSpvxzvxCweGlrcf4/w3MdL2syW1a\nVy0tjydDAgMBAAECggEABTf4okq++JfYVXtgCV6A0A3a5COtxfwUT/zh1SYl3403\n2Bs8UmVB8qMPXXBcMMGBkgp8Hkksvy7h27oj8ulR+v79PFCgxNPRj3RBhHs4ZSae\n+shESDyHUwb9rmwW6zZzI3wIs/lcq4FHED+DNYGJC1g5UP36M4C3FG3KqLNoBZpl\n3mIN4iyZMS3cmr3XKh/wswci1ge/qPntU8EEzKDML150P7o8H5B0t3FtcyUzV+YJ\n2uf4hYr3hNdNo6sPMt+IMlXq6+D+e0zc/pAKVNbo7PnOsYHKYrn3PgtxM/JL+IQs\njkVkb18U5Sjx/4ccWyxNCxgx0VwQaLIe4rITvnZb1QKBgQDhn5USw8Cfg/nTjiQT\n1881BkiQ7C1p7AS6W3a9t1Ez4rxQ10Q5gmjVdg3DWbRst8NrnSevRilLGBxccTSC\nj5XOs9etapP9SaZsBvqD3fkA5tnyOq+k0sO3OKDAdhyXUtnhP0bOpJa7ULlQlYDD\nJUsFHbfHWmCLhTf7HNwvV4rk3QKBgQDL+VtNFiBhVgsElz3VgE1xQiotxqT/ym6m\nlVNzvxlAIsOERaCLqSYXOmgINRNCUCV8qe7DmeZPIXj4xaiRjLlebY+se/YBZN4T\nfQZCNlYCJrbDDx9wsTgh1gPqqe43yo2QiEQ3TfoDt4KkjHlysp9rIzxjO+85HeA4\nVj6VE23qnwKBgGm27w9Kvw8+tCjGueq+PG0Y05lrv9+YYaK7xkggA6EvBJNQObxE\neUBDPzGf72TdOWhLy1NZqXFxC6DYvgTKqCOgqlar0ElmX97P6kMtF0Wv5MCVdMTi\nqCdKFi/3Z3ATttjOYCvkfGep7Bpw4lMNPzhXc0up8gCNW+yB2j0oZIDVAoGAcJoI\niAal+3X3gSJI9Vrt5Y9EH58gqUDEUtvuhOBC/T/ztUqGtXK8X2hT0+wQ5LO/7hEV\niQ+lr5tn39WmGCuajYFoJi0Mgnp/ijyjvtumIWvjyszHa3u55Bv0b5A9vLjp65b+\nKZW3ZmPhEBuoU+Q903RROur0RhCzHgamZ7+hFzsCgYEAqNp6KxrWwHF8MblkD6h3\nWGUCeUr3vEQz6TNZS5UKlhkiXisVOTpWvQMCZwF+hRskJs+SMtlgoo+q82o9LH8p\nCelaKRGJf5JFeLFmKm0tgjDjs51laeKgDg6SSZ74M8J6qHoGe5l64Kw5giVsj8hy\nSdRQDrKhUKSGPQj26tdY7/Y=\n-----END PRIVATE KEY-----\n"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const verifyAndDecodeFireBaseToken = async (firebase_token) => {
  if (!firebase_token){
    return {
      success: false,
      code: 401,
      message: "Unauthorized firebase_token is not provided"
    }
  }
  try{
    const decodedToken = await admin.auth().verifyIdToken(firebase_token);
    return {
      success: true,
      token: decodedToken
    }
  }catch(error){
    return {
      success: false,
      code: 401,
      message: "Unauthorized wrong firebase_token is provided"
    }
  }
}

module.exports = { admin, verifyAndDecodeFireBaseToken, getUserInfoFromMicrosoft, UtilsUser };