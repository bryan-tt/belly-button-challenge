const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

const dataPromise = d3.json(url);


function topTenOTU(data) {
    let individual = data.samples[0];
    let otuIDs = individual['otu_ids'];
    let otuIDStrings = otuIDs.map(item => `OTU ${item.toString()}`);
    let sampleValues = individual['sample_values'];
    let otuLabels = individual['otu_labels'];

    let combinedList = []
    for (let i = 0; i < sampleValues.length; i++) {
        combinedList.push([otuIDStrings[i], sampleValues[i], otuLabels[i]])
    };
    combinedList.sort((a, b) => (b[1]-a[1]));

    slicedList = combinedList.slice(0,10);

    let traceBar = {
        x: slicedList.map(item => item[1]).reverse(),
        y: slicedList.map(item => item[0]).reverse(),
        text: slicedList.map(item => item[2]).reverse(),
        type: 'bar',
        orientation: 'h',
        name: `ID: ${individual.id}`
    }

    let dataBar = [traceBar];

    let layoutBar = {
        // title: `Top 10 OTU's for ID: ${individual.id}`,
    }

    Plotly.newPlot("bar", dataBar, layoutBar);

    let traceBubble = {
        x: otuIDs,
        y: sampleValues,
        text: otuLabels,
        mode: 'markers',
        marker : {
            color: otuIDs,
            size: sampleValues
        }
    }

    let dataBubble = [traceBubble];

    let layoutBubble = {
        // title: "Bubble Chart",
        xaxis : {
            title: {
                text: 'OTU ID'
            }
        },
        height: 500
    }

    Plotly.newPlot('bubble', dataBubble, layoutBubble);
}

dataPromise.then(topTenOTU);

// Add demographic meta data
dataPromise.then(function(data) {
    let individual = data.metadata[0];
    let demo = d3.select("#sample-metadata")
    
    for (const [key, value] of Object.entries(individual)) {
        demo.append('p').text(`${key}: ${value}`);
    }

});