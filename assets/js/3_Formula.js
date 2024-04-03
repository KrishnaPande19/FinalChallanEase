<script src="xlsx.full.min.js"></script>

    function convertExcelToText(file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var wb = XLSX.read(event.target.result, { type: 'binary' });
            var sheet = wb.Sheets[wb.SheetNames[0]]; // Assume only one sheet
            var csv = XLSX.utils.sheet_to_csv(sheet);
            var lines = csv.split('\n');
            var updatedCSV = '';

            // Replace header row names to match with the desired format
            var headerRow = lines[0].split(',');
            headerRow = [
                'Sr. No.',
                'PF NO.',
                'ESIC NOS.',
                'Name',
                'Sex (M/F)',
                'Date of Birth',
                'Working Hours From',
                'Working Hours To',
                'Date of Entry',
                'Interval From',
                'Interval To',
                'Designation',
                'Basic + D.A',
                'Other Allowances',
                'Conv',
                'OT Hours',
                'Days',
                'Working Days',
                'Earned Basic + Sp. Allow',
                'HRA',
                'EarnedConv',
                'O.T',
                'Gross Salary',
                'PF',
                'ESI',
                'P. TAX',
                'Total Deductions',
                'Net Payable',
                'Month',
                'Pension Fund',
                'Insurance Fund',
                'Pension Amount',
                'Difference',
                'NCP Days',
                'Refund of Advances'
            ];

            updatedCSV += headerRow.join(',') + '\n';

            // Get the selected month and year from the datepicker
var selectedMonthYear = document.getElementById('datepicker').value;
var selectedMonth = selectedMonthYear.split('-')[1];
var selectedYear = selectedMonthYear.split('-')[0];

// Convert the numeric month to its corresponding name abbreviation
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var formattedMonth = monthNames[parseInt(selectedMonth) - 1]; // Subtracting 1 because month indexing starts from 0

// Concatenate the formatted month and year
var month = formattedMonth + ' - ' + selectedYear;


            // Extract values from file and process data
            for (var i = 1; i < lines.length - 1; i++) {
                var row = lines[i].split(',');

                // Calculate other values based on extracted data
                var basicDA = parseInt(row[12]);
                var Conv = parseInt(row[14]);
                var WorkD = parseInt(row[17]); // Get the working days from the file
                var days = parseInt(row[15]); // Get the days from the file
                var otHours = parseInt(row[16]); // Get the OT hours from the file
                var earnedBasicSpAllow = Math.round((basicDA / WorkD) * days);
                var earbedConvence = Math.round((Conv / WorkD) * days);
                var hra = Math.round(0.05 * earnedBasicSpAllow);
                var ot = Math.round((basicDA / 26 / 4) * otHours);
                var grossSalary = earnedBasicSpAllow + hra + ot + parseInt(row[13]);
                var pf = Math.round(0.12 * earnedBasicSpAllow);
                var esi = Math.round(0.0075 * grossSalary);
                var pTax = 0;
                if (row[4].trim() === 'M') {
                    if (grossSalary > 10000) {
                        pTax = 200;
                    } else if (grossSalary > 7500) {
                        pTax = 175;
                    }
                } else {
                    if (grossSalary > 25000) {
                        pTax = 200;
                    }
                }
                var totalDeduc = pf + esi + pTax;
                var netPayable = grossSalary - totalDeduc;
                

                var pensionFund = 0;
                var insuranceFund = 0;
                if (earnedBasicSpAllow <= 15000) {
                    pensionFund = earnedBasicSpAllow;
                    insuranceFund = earnedBasicSpAllow;
                } else {
                    pensionFund = 15000;
                    insuranceFund = 15000;
                }

                var pensionAmount = Math.round(pensionFund * 0.0833);
                var difference = pf - pensionAmount;
                var ncpDays = WorkD - days;

                // Add calculated values and adjust column positions
                row.splice(18, 0, earnedBasicSpAllow, hra, earbedConvence, ot, grossSalary, pf, esi, pTax, totalDeduc, netPayable, month, pensionFund, insuranceFund, pensionAmount, difference, ncpDays, 0);

                updatedCSV += row.join(',') + '\n';
            }

            // Create a blob with the updated CSV content
            var blob = new Blob([updatedCSV], { type: 'text/plain' });
            var url = window.URL.createObjectURL(blob);

            // Convert to CSV
            convertTextToCSV(blob, file);
        };
        reader.readAsBinaryString(file);
    }

    function convertTextToCSV(textBlob, originalFile) {
        var reader = new FileReader();
        reader.onload = function (event) {
            // Create a download link for the text file
            var downloadLink = document.createElement('a');
            downloadLink.href = event.target.result;
            downloadLink.download = originalFile.name.replace('.xlsx', '_temp.txt');
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Cleanup
            document.body.removeChild(downloadLink);

            // Convert text file to CSV
            var csvBlob = new Blob([event.target.result], { type: 'text/csv' });
            var csvUrl = window.URL.createObjectURL(csvBlob);

            // Create a download link for the CSV file
            var csvDownloadLink = document.createElement('a');
            csvDownloadLink.href = csvUrl;
            csvDownloadLink.download = originalFile.name.replace('.xlsx', '.csv');

            // Append the download link to the document body
            var downloadButton = document.createElement('button');
            downloadButton.innerText = 'Download Converted CSV';
            downloadButton.onclick = function () {
                document.body.appendChild(csvDownloadLink);
                csvDownloadLink.click();
                // Cleanup
                document.body.removeChild(csvDownloadLink);
                window.URL.revokeObjectURL(csvUrl);
            };

            document.body.appendChild(downloadButton);
        };
        reader.readAsText(textBlob);
    }

    function handleFileUpload(event) {
        var file = event.target.files[0];
        if (file) {
            convertExcelToText(file);
        } else {
            alert("Please select a file.");
        }
    }
