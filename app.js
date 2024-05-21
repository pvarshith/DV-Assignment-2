// Define colors for each building
const buildingColors = {
    "Facilities": "#FF6384",
    "Swig": "#36A2EB",
    "Vari Hall & Lucas Hall": "#FFCE56",
    "Malley": "#4BC0C0",
    "University Villas": "#9966FF",
    "Graham": "#FF9F40",
    "Benson Center": "#C9CBCF",
    "Learning Commons": "#7E57C2"
};

// Normalize building names for consistent comparison
function normalizeBuildingName(name) {
    return name.trim().replace(/ & /g, ' and ').toUpperCase();
}

// Initialize charts with data
function initializeCharts(data) {
    const buildings = [...new Set(data.map(item => item.Building))];
    updateBarChart(buildings, data);
}

// Update bar chart visualization
function updateBarChart(buildings, data) {
    const wasteDataByBuilding = buildings.map(building => {
        const filteredData = data.filter(item => normalizeBuildingName(item.Building) === normalizeBuildingName(building));
        return filteredData.reduce((acc, item) => acc + (parseFloat(item.Weight) || 0), 0);
    });

    const barChartCanvas = document.getElementById('barChart').getContext('2d');
    if (window.barChart && typeof window.barChart.destroy === 'function') {
        window.barChart.destroy();
    }

    
    window.barChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: {
            labels: buildings,
            datasets: [{
                label: '',
                data: wasteDataByBuilding,
                backgroundColor: buildings.map(building => buildingColors[building] || "#000000")
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeInOutQuad'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return tooltipItem.yLabel + ' lbs';  // Modified to not show dataset label
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            legend: {
                display: false
            }
        }
    });
}

// Set up the building filter dropdown
function setupBuildingFilter(data) {
    const selector = document.getElementById('buildingSelector');
    selector.addEventListener('change', () => {
        const selectedBuilding = selector.value;
        const filteredData = selectedBuilding === 'All' ? data : data.filter(item => normalizeBuildingName(item.Building) === normalizeBuildingName(selectedBuilding));
        const buildings = selectedBuilding === 'All' ? [...new Set(data.map(item => item.Building))] : [selectedBuilding];
        updateBarChart(buildings, filteredData);
    });
}

// Setup checkboxes for building selection
function setupBuildingCheckboxes() {
    const buildings = ["Facilities", "Swig", "Vari Hall & Lucas Hall", "Malley", "University Villas", "Graham", "Benson Center", "Learning Commons"];
    const container = document.getElementById('buildingCheckboxes');
    buildings.forEach(building => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = building;
        checkbox.checked = true;
        checkbox.onchange = updateCharts;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(building));
        container.appendChild(label);
    });
}

// Update charts based on checkbox selection
function updateCharts() {
    const selectedBuildings = Array.from(document.querySelectorAll('#buildingCheckboxes input[type="checkbox"]:checked')).map(cb => cb.value);
    fetch('assign2_wastedata.json')
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(item => selectedBuildings.includes(item.Building));
            updateBarChart([...new Set(filteredData.map(item => item.Building))], filteredData);
        });
}

// Document ready function to initialize everything
document.addEventListener('DOMContentLoaded', function() {
    fetch('assign2_wastedata.json')
        .then(response => response.json())
        .then(data => {
            setupBuildingCheckboxes();
            initializeCharts(data);
            setupBuildingFilter(data);
        })
        .catch(error => console.error('Error loading the data:', error));
});
