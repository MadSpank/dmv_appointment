async function postData(preferredNumberOfDays) {
    const url = "https://publicapi.txdpsscheduler.com/api/AvailableLocation";
    const jsonContent = JSON.stringify({
        "TypeId": 21,
        "ZipCode": 75034, // Changed to number if server expects number
        "CityName": "",
        "PrefferedDay": 0 // Ensure it matches the parameter name expected by the server
    });
  
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Host": "publicapi.txdpsscheduler.com",
        "Origin": "https://public.txdpsscheduler.com",
        "Cookie": "ARRAffinity=47b778e16dedce72e7232458e57c942b9fa7e3bc6ce76a6a2d4b2f5b246c81aa; ARRAffinitySameSite=47b778e16dedce72e7232458e57c942b9fa7e3bc6ce76a6a2d4b2f5b246c81aa"
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: jsonContent
        });
  
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
  
        const result = await response.text();  
        const cleanedResult = result.replace(/\\'/g, "'")
        const data = JSON.parse(JSON.parse(cleanedResult));

        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
  }
  
function checkDate(data, preferredNumberOfDays) {
    const todayDate = new Date();
    const result = [];
    for (const availableDate of data) {
        const apptDate = Date.parse(availableDate.NextAvailableDate)
        const daysToAppt = Math.abs(todayDate - apptDate) / (1000 * 60 * 60 * 24);
        if (daysToAppt <= preferredNumberOfDays) {
            console.log('Appointment available on:', availableDate.NextAvailableDate);
            result.push({
                DaysToAppt: daysToAppt,
                Name: availableDate.Name,
                Address: availableDate.Address,
                Distance: availableDate.Distance,
                NextAvailableDate: availableDate.NextAvailableDate,
                Url: availableDate.Url,
                MapUrl: availableDate.MapUrl,
            });
        }
    }
    return result;
}

const findAppointments = async (preferredNumberOfDays) => {
    const data = await postData(preferredNumberOfDays);
    const availableDates = checkDate(data, preferredNumberOfDays);
    if (availableDates.length === 0) {
        console.log('No appointments available within the preferred number of days');
    } else {
        console.log('Appointments available within the preferred number of days:', availableDates);
        return true;
    }
}

async function main() {
    while (true) {
        const isFound = await findAppointments(100);
        if (isFound) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}


main();


  