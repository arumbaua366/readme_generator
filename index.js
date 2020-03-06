const fs = require(`fs`)
const util = require(`util`)
const inquirer = require(`inquirer`)
const moment = require(`moment`)
const axios = require(`axios`)

const writeFileSync = util.promisify(fs.writeFile)

const questions = [
    {
        name: `name`,
        type: `input`,
        message: `What is your first and last name?`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input === `   ` || input.length < 3) {
               return `A minimum of `
            }
            return true
         }
    },
    {
        name: `githubName`,
        type: `input`,
        message: `Please enter your GitHub username:`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input === `   ` || input.length < 3) {
               return `must make an entry to continue (min. 3 characters)`
            }
            return true
         }
    },
    {
        name: `title`,
        type: `input`,
        message: `What is the name of your project?`,
        default: `Untitled`,
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

const generateREADME = (data) => {
    console.log("data:", data)
    if (data.email === undefined || data.email === null) {
        gitEmail = `[no email found]`
    }
    if (data.installation === undefined) {
        data.installation = `[Enter installation information here]`
    }
    if (data.description === undefined) {
        data.description = `[Enter project description here]`
    }
    if (data.usage === undefined) {
        data.usage = `[Enter how project is to be used here]`
    }
    if (data.contributing === undefined) {
        data.contributing = `[Enter other contributors here]`
    }
    if (data.license === undefined) {
        data.license = `[Enter licenses used here]`
    }

    let socialBadge = `https://img.shields.io/github/followers/${data.login}?style=social`
    return `# ${data.title}
    
A Project by: ${data.name} (GitHub: @${data.login}) [![User Followers](${socialBadge})](${gitMainURL+`?tab=followers`})
[![GitHub Avatar](${data.avatar_url})](${gitMainURL})
1. My email address: ${data.email}
2. Location: ${data.location}
### Description
* ${data.description}
### Installation
* ${data.installation}
### Usage
* ${data.usage}
### License
* ${data.license}
Contributors
* ${data.name} and ${data.contributing}
`
}

async function renderNewFile() {
    try {
        let filename = `generated-files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`
        let gitPhotoURL, gitEmail, gitMainURL

        const answers = await askUser()             // waiting for inquirer prompt to gather all answers from user

        let userURL = `https://api.github.com/users/${answers.githubName}`
        let repoURL = `https://api.github.com/users/${answers.githubName}/repos?sort=created&direction=desc&per_page=100`

        // waiting for an axios call to get GitHub user information before we continue
        await axios.get(userURL).then(res => {

            console.log(res.data)
            gitPhotoURL = res.data.avatar_url       // saving profile avatar url to variable
            gitEmail = res.data.email               // saving user's email to variable
            gitMainURL = res.data.html_url          // saving user's github url to variable
        })

        const readmeText = generateREADME(...answers, ...res.data)         // send answers obj to generateREADME function to parse 
        await writeFileSync(filename, readmeText)                                 // create README.md file (timestamped) with README template
        
        console.log(`Thank you ~ File created (${filename}).`)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()

module.exports = {
    askUser: askUser,
    generateREADME: generateREADME,
    questions:questions,

}