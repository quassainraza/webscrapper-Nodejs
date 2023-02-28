const feedDisplay = document.querySelector('#feed')

fetch('http://localhost:8000/results')
    .then(response => {return response.json()})
    .then(data => {
        data.forEach(joboffers => {
            const jobItem = `<div><h3><b>` + joboffers.jobtitle + `</h3><p>` + joboffers.jobsalary + `</p></div>`+ joboffers.publishdate + `</p></div>`+ joboffers.positionarea + `</p></div>`+ joboffers.profession + `</p></div>`+ joboffers.companyName + `</p></div>`+ joboffers.location + `</p></div>`
            feedDisplay.insertAdjacentHTML("beforeend", jobItem)
        })
    })
    .catch(err => console.log(err))