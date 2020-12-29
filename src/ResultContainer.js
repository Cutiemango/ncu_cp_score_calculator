import React, {Fragment} from 'react';

function ResultContainer({submissions, rating, contests}) {
    const contestList = {295849: 1, 296944: 2, 298568: 3, 301125: 4, 304895: 5, 308133: 6};
    const problemIDs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    const basicProblems = {
        1: [],
        2: ["E"],
        3: ["C", "E"],
        4: ["B", "C"],
        5: ["A", "B", "C", "D", "E", "H", "I"],
        6: ["A", "B", "F", "G", "H", "I", "J", "K"]
    };
    const bonusProblems = {
        1: [],
        2: ["F", "G"],
        3: ["G", "H"],
        4: ["D"],
        5: ["F", "G"],
        6: ["C", "D", "E"]
    };
    const ratingScore = {800: 2, 1299: 5, 1599: 10, 1899: 15}

    let result = {1: [], 2: [], 3: [], 4: [], 5: [], 6: []};
    let solvedBasics = 0, solvedBonus = 0;

    if (submissions.length > 0)
    {
        submissions.forEach(submission => {
            if (submission.verdict === "OK" && contestList.hasOwnProperty(submission.contestId))
            {
                const contestNo = contestList[submission.contestId];
                let solved = result[contestNo];
                if (!solved.includes(submission.problem.index))
                    solved.push(submission.problem.index);
                result[contestNo] = solved;
            }
        });
    }

    const renderHeader = () => {
        return (
            <Fragment>
                <th>Contest No.</th>
                {problemIDs.map((id, index) => {
                    return <th key={index}>{id}</th>;
                })}
            </Fragment>
        );
    }

    const renderRow = () => {
        return Object.keys(contestList).map((id, _) => {
            const index = contestList[id], solved = result[index];
            return (
                <tr key={id}>
                    <td>{index}</td>
                    {problemIDs.map((pID, pIndex) => {
                        const isBasic = basicProblems[index].includes(pID), isBonus = bonusProblems[index].includes(pID), hasSolved = solved.includes(pID);
                        if (hasSolved)
                        {
                            if (isBasic) solvedBasics++;
                            else if (isBonus) solvedBonus++;
                            return <td key={pIndex}>{isBasic || isBonus ? "✓" : "+"}</td>;
                        }
                        return <td key={pIndex}>{isBasic || isBonus ? "✗" : " "}</td>;
                    })}
                </tr>
            );
        });
    }

    const renderTable = () => {
        return (
            <Fragment>
                <table id='table'>
                    <tbody>
                        <tr>{renderHeader()}</tr>
                        {renderRow()}
                    </tbody>
                </table>
            </Fragment>
        )
    }

    const getExtraScore = (rating) => {
        if (rating === undefined || rating === -1) return 0;
        for (var key in ratingScore)
            if (rating < key)
                return ratingScore[key];
        return 100;
    }

    const renderInfo = () => {
        const score = 8 * Math.min(solvedBasics, 9) + 5 * Math.min(solvedBonus, 5) + getExtraScore(rating) + Math.min(5*contests, 20);
        return (
            <Fragment>
                <h3>You have solved ({solvedBasics}/9) basic problems. (+{8 * Math.min(solvedBasics, 9)})</h3>
                <h3>You have solved ({solvedBonus}/5) bonus problems. (+{5 * Math.min(solvedBonus, 5)})</h3>
                <h3>{rating === -1 ? "You are unrated! (+0)" : `Your rating is ${rating}. (+${getExtraScore(rating)})`}</h3>
                <h3>{contests === 0 ? "You have not participated any rated contests. (+0)" :
                    `Woohoo! You have participated (${contests}/4) rated contest(s). (+${Math.min(5*contests, 20)})`}</h3>
                <p></p>
                <h3>Your estimated score is {score} points.</h3>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <h1 id='title'>Fetch Results: </h1>
            <h4>+ = not assigned problems, accepted</h4>
            <h4>✓ = assigned problems, accepted</h4>
            <h4>✗ = assigned problems, not finished</h4>
            <h4>(blank) = no record</h4>
            {renderTable()}
            {renderInfo()}
        </Fragment>
    )
}

export default ResultContainer