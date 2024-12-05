export function numberToWords(num: number): string {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanOneThousand(n: number): string {
        if (n === 0) return '';
        
        if (n < 10) return units[n];
        
        if (n < 20) return teens[n - 10];
        
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
        }
        
        return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    }

    if (num === 0) return 'Zero Rupees Only';
    
    let result = '';
    
    if (num >= 10000000) {
        result += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }
    
    if (num >= 100000) {
        result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }
    
    if (num >= 1000) {
        result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }
    
    result += convertLessThanOneThousand(num);
    
    return result.trim() + ' Rupees Only';
}
