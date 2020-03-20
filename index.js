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
            if (input === null || input === `    ` || input.length < 4) {
               return `You must enter your first and last name.`
            }
            return true;
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
            return true;
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
const user = () => {
    return inquirer.prompt(questions)
}

const readME = (data) => {
    console.log("data: ", data)
    if (data.email === undefined || data.email === null) {
        data.email = `[no email found]`
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

    let shieldsBadge = `https://img.shields.io/github/followers/${data.login}?style=social`
    return `# ${data.title}
    
Project Title: ${data.name} 
GitHub: @${data.login}) [![User Followers](${shieldsBadge})](${gitURL+`?tab=followers`})
[![GitHub Avatar](${data.avatar_url})](${gitURL})
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
        let filename = `githubgen_files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`

        const answers = await user()

        let userURL = `https://api.github.com/users/${answers.githubName}`
        // let repoURL = `https://api.github.com/users/${answers.githubName}/repos?sort=created&direction=desc&per_page=100`

        // wait for axios call for GitHub info
        await axios.get(userURL).then(res => {

            console.log(res.data)
            gitEmail = res.data.email
            gitURL = res.data.html_url
            gitAvatarURL = res.data.avatar_url
        })

        const readmeText = readME(answers, ...res.data)          
        await writeFileSync(filename, readmeText)
        
        console.log(`File created: (${filename}).`)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()

module.exports = {
    user: user,
    readME: readME,
    questions: questions,

}