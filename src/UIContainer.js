import React, {useState} from 'react';
import ResultContainer from './ResultContainer';
const crypto = require('crypto'); 

function UIContainer()
{
    const CONTESTID_THRESHOLD = 1409;

    const [credentials, setCredentials] = useState({
        handle: "",
        key: "",
        secret: ""
    });
    const [submissions, setSubmissions] = useState([]);
    const [rating, setRating] = useState(-1);
    const [contests, setContests] = useState(0);
    const {handle, key, secret} = credentials;

    const fetchSubmissions = () => {
        let randomSixDigit = Math.floor((Math.random() * 900000) + 100000);
        let paramList = {apiKey: key, count: 500, handle: handle, time: Math.floor(Date.now() / 1000)};
        let cryptString = `${randomSixDigit}/user.status?`;
        cryptString += Object.keys(paramList).map((key, _) => {
            return `${key}=${paramList[key]}`
        }).join('&');
        cryptString += `#${secret}`;

        let apiSecret = crypto.createHash('sha512').update(cryptString).digest('hex');
        
        paramList["apiSig"] = `${randomSixDigit}${apiSecret}`;
        
        let url = 'https://codeforces.com/api/user.status?';
        url += Object.keys(paramList).map((key, _) => {
            return `${key}=${paramList[key]}`
        }).join('&');
        
        console.log(url);

        fetch(url, {})
            .then((response) => response.json())
            .then(
                (data) => {
                    setSubmissions(data.result);
                },
                (error) => {
                    console.log('Error: ', error);
                }
            );
    }

    const fetchContests = async () => {
        let qualifiedContests = []
        let ratingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`

        try {
            const ratingData = await fetch(ratingUrl, {})
            const parsedRatingData = await ratingData.json()
            parsedRatingData.result.forEach(ratingChange => {
                if (ratingChange.contestId >= CONTESTID_THRESHOLD)
                    qualifiedContests.push(ratingChange.contestId)
            })
            let cnt = 0;
            for (let i = 0; i < qualifiedContests.length; i++)
            {
                if (cnt >= 4) break;
                const contestID = qualifiedContests[i];
                console.log("Fetching contest: " + contestID)
                let contestUrl = `https://codeforces.com/api/contest.standings?contestId=${contestID}&handles=${handle}`
                const contestData = await fetch(contestUrl, {})
                const parsedContestData = await contestData.json()
                console.log(parsedContestData)
                if (parsedContestData.result.rows[0].problemResults.find(problemRes => problemRes.points > 0))
                    cnt++;
            }
            setContests(cnt);
        } catch (error) {
            console.log('Error: ', error);
        }
    }

    const fetchProfile = () => {
        let url = `https://codeforces.com/api/user.info?handles=${handle}`
        fetch(url, {})
            .then((response) => response.json())
            .then(
                (data) => {
                    setRating(data.result[0].rating === undefined ? -1 : data.result[0].rating);
                },
                (error) => {
                    console.log('Error: ', error);
                }
            );
    }

    const handleInputChange = (event) => {
        event.preventDefault();
        setCredentials(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchSubmissions();
        fetchProfile();
        fetchContests();
    }

    return (
        <div id = "codeforces_credentials">
            <form onSubmit={handleSubmit}>
                <p>Handle is: {handle}</p>
                <p><input name="handle" type="text" placeholder="Your codeforces handle" value={handle} onChange={handleInputChange} /></p>
                <p>Key is: {key}</p>
                <p><input name="key" type="text" placeholder="Your codeforces API key" value={key} onChange={handleInputChange}/></p>
                <p>Secret is: {secret}</p>
                <p><input name="secret" type="text" placeholder="Your codeforces API secret" value={secret} onChange={handleInputChange}/></p>

                <p><button>Fetch results</button></p>
                {submissions.length > 0 && <ResultContainer submissions={submissions} rating={rating} contests={contests}/>}
            </form>
        </div>
    )
}

export default UIContainer