const url =
    "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

const dataPromise = d3.json(url);

// Add ID's to drop down menu
dataPromise.then(function (data) {
    let ids = data.names;
    let menu = d3.select("#selDataset");
    for (let i = 0; i < ids.length; i++) {
        menu.append("option").attr("value", ids[i]).text(ids[i]);
    }
});

// Initialize horizontal bar chart and bubble chart
dataPromise.then(function (data) {
    // Grab first sample
    let individual = data.samples[0];

    // grab all OTU ids for this sample
    let otuIDs = individual["otu_ids"];

    // Transform OTU ids to string and add "OTU" in front of each id
    let otuIDStrings = otuIDs.map((item) => `OTU ${item.toString()}`);

    // Grab sample values and labels
    let sampleValues = individual["sample_values"];
    let otuLabels = individual["otu_labels"];

    // Combine all arrays so we can sort and slice off top 10
    let combinedList = [];
    for (let i = 0; i < sampleValues.length; i++) {
        combinedList.push([otuIDStrings[i], sampleValues[i], otuLabels[i]]);
    }
    combinedList.sort((a, b) => b[1] - a[1]);

    slicedList = combinedList.slice(0, 10);

    // Create horizontal bar chart
    let traceBar = {
        x: slicedList.map((item) => item[1]).reverse(),
        y: slicedList.map((item) => item[0]).reverse(),
        text: slicedList.map((item) => item[2]).reverse(),
        type: "bar",
        orientation: "h",
        name: `ID: ${individual.id}`,
    };

    let dataBar = [traceBar];

    let layoutBar = {
        title: `Top 10 Microbial Species for ID: ${individual.id}`,
    };

    Plotly.newPlot("bar", dataBar, layoutBar);

    // create Bubble chart
    let traceBubble = {
        x: otuIDs,
        y: sampleValues,
        text: otuLabels,
        mode: "markers",
        marker: {
            color: otuIDs,
            size: sampleValues,
        },
    };

    let dataBubble = [traceBubble];

    let layoutBubble = {
        // title: "Bubble Chart",
        xaxis: {
            title: {
                text: "OTU ID",
            },
        },
        height: 550,
    };

    let configBubble = { responsive: true };

    Plotly.newPlot("bubble", dataBubble, layoutBubble);
});

// Initialize demographic meta data
dataPromise.then(function (data) {
    let individual = data.metadata[0];
    let demo = d3.select("#sample-metadata");

    // grab each meta data and append as <p>
    for (const [key, value] of Object.entries(individual)) {
        demo.append("p").text(`${key}: ${value}`);
    }
});

// Create bonus chart for # of washes
dataPromise.then(function (data) {
    let wash = data.metadata[0].wfreq;
    var level = wash; // Set the level between 1 and 9
    var degrees = 360 - (level - 1) * 71;
    var radius = 0.5;
    var radians = (degrees * Math.PI) / 360;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = "M -.0 -0.035 L .0 0.035 L ",
        pathX = String(x),
        space = " ",
        pathY = String(y),
        pathEnd = " Z";
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var dataGauge = [
        {
            type: "category",
            x: [0],
            y: [0],
            marker: { size: 28, color: "850000" },
            showlegend: false,
            name: "Washes",
            text: level,
            hoverinfo: "text+name",
        },
        {
            // values: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
            rotation: 180,
            text: ["9", "8", "7", "6", "5", "4", "3", "2", "1", "0"],
            textinfo: "text",
            textposition: "inside",
            marker: {
                colors: [
                    "rgba(14, 127, 0, .5)",
                    "rgba(61, 134, 15, .5)",
                    "rgba(110, 154, 22, .5)",
                    "rgba(136, 170, 30, .5)",
                    "rgba(170, 202, 42, .5)",
                    "rgba(202, 209, 95, .5)",
                    "rgba(209, 187, 100, .5)",
                    "rgba(210, 166, 106, .5)",
                    "rgba(210, 146, 112, .5)",
                    "rgba(210, 126, 118, .5)"
                  ],
            },
            labels:["9", "8", "7", "6", "5", "4", "3", "2", "1", "0"],
            hoverinfo: "label",
            hole: 0.5,
            type: "pie",
            showlegend: false,
        },
    ];

    var layoutGauge = {
        shapes: [
            {
                type: "path",
                path: path,
                fillcolor: "850000",
                line: {
                    color: "850000",
                },
            },
        ],
        title: "<b>Belly Button Washing Frequency</b><br>Scrubs Per Week",
        // titlefont: {size: 24},
        height: 500,
        width: 600,
        xaxis: {
            type: "category",
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1],
        },
        yaxis: {
            type: "category",
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1],
        },
    };

    Plotly.newPlot("gauge", dataGauge, layoutGauge);
});

// Function for when drop down menu changes
function optionChanged(id) {
    // find what is in the drop down menu
    let test = id;
    let index = 0;

    // Find the index of what is currently in the dropdown menu
    dataPromise.then(function (data) {
        for (let i = 0; i < data.names.length; i++) {
            if (test == data.names[i]) {
                index = i;
            }
        }
    });


    // Update the metadata
    dataPromise.then(function (data) {
        let index = 0;
        for (let i = 0; i < data.names.length; i++) {
            if (test == data.names[i]) {
                index = i;
            }
        }
        let individual = data.metadata[index];
        let demo = d3.select("#sample-metadata");
        demo.selectAll("p").remove();
        for (const [key, value] of Object.entries(individual)) {
            demo.append("p").text(`${key}: ${value}`);
        }
    });

    // Update bar chart and bubble chart
    dataPromise.then(function (data) {
        let individual = data.samples[index];
        let otuIDs = individual["otu_ids"];
        let otuIDStrings = otuIDs.map((item) => `OTU ${item.toString()}`);
        let sampleValues = individual["sample_values"];
        let otuLabels = individual["otu_labels"];

        let combinedList = [];
        for (let i = 0; i < sampleValues.length; i++) {
            combinedList.push([otuIDStrings[i], sampleValues[i], otuLabels[i]]);
        }
        combinedList.sort((a, b) => b[1] - a[1]);

        slicedList = combinedList.slice(0, 10);

        let traceBar = {
            x: slicedList.map((item) => item[1]).reverse(),
            y: slicedList.map((item) => item[0]).reverse(),
            text: slicedList.map((item) => item[2]).reverse(),
            type: "bar",
            orientation: "h",
            name: `ID: ${individual.id}`,
        };

        let dataBar = [traceBar];

        let layoutBar = {
            title: `Top 10 Microbial Species for ID: ${individual.id}`,
        };

        Plotly.newPlot("bar", dataBar, layoutBar);

        let traceBubble = {
            x: otuIDs,
            y: sampleValues,
            text: otuLabels,
            mode: "markers",
            marker: {
                color: otuIDs,
                size: sampleValues,
            },
        };

        let dataBubble = [traceBubble];

        let layoutBubble = {
            // title: "Bubble Chart",
            xaxis: {
                title: {
                    text: "OTU ID",
                },
            },
            height: 500,
        };

        Plotly.newPlot("bubble", dataBubble, layoutBubble);
    });

    // Update # of washes chart
    dataPromise.then(function (data) {
        let wash = data.metadata[index].wfreq;
    
        var level = wash; // Set the level between 1 and 9
        var degrees = 360 - (level - 1) * 71;
        var radius = 0.5;
        var radians = (degrees * Math.PI) / 360;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
    
        // Path: may have to change to create a better triangle
        var mainPath = "M -.0 -0.035 L .0 0.035 L ",
            pathX = String(x),
            space = " ",
            pathY = String(y),
            pathEnd = " Z";
        var path = mainPath.concat(pathX, space, pathY, pathEnd);
    
        var dataGauge = [
            {
                type: "category",
                x: [0],
                y: [0],
                marker: { size: 28, color: "850000" },
                showlegend: false,
                name: "Washes",
                text: level,
                hoverinfo: "text+name",
            },
            {
                // values: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                rotation: 180,
                text: ["9", "8", "7", "6", "5", "4", "3", "2", "1", "0"],
                textinfo: "text",
                textposition: "inside",
                marker: {
                    colors: [
                        "rgba(14, 127, 0, .5)",
                        "rgba(61, 134, 15, .5)",
                        "rgba(110, 154, 22, .5)",
                        "rgba(136, 170, 30, .5)",
                        "rgba(170, 202, 42, .5)",
                        "rgba(202, 209, 95, .5)",
                        "rgba(209, 187, 100, .5)",
                        "rgba(210, 166, 106, .5)",
                        "rgba(210, 146, 112, .5)",
                        "rgba(210, 126, 118, .5)"
                      ],
                },
                labels:["9", "8", "7", "6", "5", "4", "3", "2", "1", "0"],
                hoverinfo: "label",
                hole: 0.5,
                type: "pie",
                showlegend: false,
            },
        ];
    
        var layoutGauge = {
            shapes: [
                {
                    type: "path",
                    path: path,
                    fillcolor: "850000",
                    line: {
                        color: "850000",
                    },
                },
            ],
            title: "<b>Belly Button Washing Frequency</b><br>Scrubs Per Week",
            // titlefont: {size: 24},
            height: 500,
            width: 600,
            xaxis: {
                type: "category",
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
            },
            yaxis: {
                type: "category",
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
            },
        };
    
        Plotly.update("gauge", dataGauge, layoutGauge);
    });
}
