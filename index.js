const inquirer = require(`inquirer`)
const axios = require(`axios`)
const fs = require(`fs`)
const util = require(`util`)
const moment = require(`moment`)

const writeFileSync = util.promisify(fs.writeFile)

const questions = [
    {
        name: `name`,
        type: `input`,
        message: `What is your first and last name?`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input === `   ` || input.length < 3) {
               return `You must enter a name (minimum 4 characters).`
            }
            return true
         }
    },
    {
        name: `githubName`,
        type: `input`,
        message: `Please enter your GitHub username:`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input.length < 2) {
               return `You must enter at a GitHub username (minimum 2 characters).`
            }
            return true
         }
    },
    {
        name: `title`,
        type: `input`,
        message: `Please provide the title of your project:`,
        default: `N/A`,
    },
    {
        name: `description`,
        type: `input`,
        message: `Write a brief description of your project:`,
        default: `N/A`,
    },
    {
        name: `contents`,
        type: `input`,
        message: `Provide a table of contents.`,
        default: `N/A`,
    },
    {
        name: `installation`,
        type: `input`,
        message: `How is your application installed?`,
        default: `N/A`,
    },
    {
        name: `usage`,
        type: `input`,
        message: `How is your application used?`,
        default: `N/A`,
    },
    {
        name: `license`,
        type: `input`,
        message: `Which license(s) will you be assigning to this project?`,
        default: `N/A`,
    },
    {
        name: `contributing`,
        type: `input`,
        message: `Who else contributed to this project?`,
        default: `N/A`,
    },
    {
        name: `tests`,
        type: `input`,
        message: `What tests have you conducted to ensure the application is working correctly?`,
        default: `N/A`,
    },
    {
        name: `faq`,
        type: `input`,
        message: `FAQs:`,
        default: `N/A`,
    },
]
const askUser = () => {
    return inquirer.prompt(questions)
}

const readME = (resp, gitPhotoURL, gitEmail, gitMainURL) => {
    console.log("responses:", resp)
    if (gitEmail === undefined || gitEmail === null) {
        gitEmail = `[no email found]`
    }
    if (resp.installation === undefined) {
        resp.installation = `[Enter installation information here]`
    }
    if (resp.description === undefined) {
        resp.description = `[Enter project description here]`
    }
    if (resp.usage === undefined) {
        resp.usage = `[Enter how project is to be used here]`
    }
    if (resp.contributing === undefined) {
        resp.contributing = `[Enter other contributors here]`
    }
    if (resp.license === undefined) {
        resp.license = `[Enter licenses used here]`
    }

    let socialBadge = `https://img.shields.io/github/followers/${resp.githubName}?style=social`
    return `# ${resp.title}
    
Project Title: ${resp.name} (GitHub: @${resp.githubName}) [![User Followers](${socialBadge})](${gitMainURL+`?tab=followers`})
[![GitHub Avatar](${gitPhotoURL})](${gitMainURL})
* Email address: ${gitEmail}
// 2. Location: ${resp.location}
### Description
* ${resp.description}
### Installation
* ${resp.installation}
### Usage
* ${resp.usage}
### License
* ${resp.license}
### Contributors
* ${resp.name} and ${resp.contributing}
`
}

async function renderNewFile() {
    try {
        let filename = `githubgen_files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`
        let gitPhotoURL, gitEmail, gitMainURL

        const answers = await askUser()             // waiting for inquirer prompt to gather all answers from user

        let userURL = `https://api.github.com/users/${answers.githubName}`
        // let repoURL = `https://api.github.com/users/${answers.githubName}/repos?sort=created&direction=desc&per_page=100`

        // waiting for an axios call to get GitHub user information before we continue
        await axios.get(userURL).then(res => {

            console.log(res.data)
            gitPhotoURL = res.data.avatar_url       // saving profile avatar url to variable
            gitEmail = res.data.email               // saving user's email to variable
            gitMainURL = res.data.html_url          // saving user's github url to variable
        })

        const readmeText = readME(answers, gitPhotoURL, gitEmail, gitMainURL)         // send answers obj to generateREADME function to parse 
        await writeFileSync(filename, readmeText)                                 // create README.md file (timestamped) with README template
        
        console.log(`Thank you ~ File created (${filename}).`)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()

module.exports = {
    askUser: askUser,
    readME: readME,
    questions:questions,

}