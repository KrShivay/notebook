import React from "react";

interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    startDate: string;
    endDate: string;
    days: number;
    amount: number;
    amountInWords: string;
    supplier: {
        name: string;
        address: string;
        pan: string;
        bank: {
            name: string;
            bankName: string;
            accountNo: string;
            ifsc: string;
        };
        rate: number;
    };
    client: {
        name: string;
        address: string;
        gstin: string;
    };
}

interface InvoiceComponentProps {
    data: InvoiceData;
}

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({ data }) => {
  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "20px",
  };

  const cellStyles = {
    border: "1px solid #bfbfbf",
    padding: "8px",
    textAlign: "left" as const,
  };

  const headerCellStyles = {
    ...cellStyles,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  };

  const signatureStyles = {
    textAlign: "center" as const,
    fontWeight: "bold",
    border: "1px solid #bfbfbf",
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <table style={tableStyles}>
        <tbody>
          <tr>
            <td colSpan={2} style={cellStyles}></td>
            <td colSpan={2} style={{ ...headerCellStyles, fontSize: "14px" }}>
              INVOICE
            </td>
          </tr>
          <tr>
            <td style={cellStyles}></td>
            <td style={cellStyles}></td>
            <td style={cellStyles}>INVOICE DATE</td>
            <td style={cellStyles}>{data?.invoiceDate}</td>
          </tr>
          <tr>
            <td style={cellStyles}>SUPPLIER</td>
            <td style={cellStyles}>INVOICE NO</td>
            <td colSpan={2} style={cellStyles}>
              {data?.invoiceNumber}
            </td>
          </tr>
          <tr>
            <td style={cellStyles}>
              {data?.supplier?.name} <br />
              {data?.supplier?.address}
              <br />
              PAN: {data?.supplier?.pan}
            </td>
            <td colSpan={3} style={cellStyles}>
              <strong>Client</strong>
              <br />
              {data?.client?.name}
              <br />
              {data?.client?.address}
              <br />
              GSTIN/UIN: {data?.client?.gstin}
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cellStyles}>
              Job Description:
            </td>
          </tr>
          <tr>
            <td style={cellStyles}>SR.NO.</td>
            <td style={cellStyles}>DETAILS</td>
            <td colSpan={2} style={headerCellStyles}>
              AMOUNT (INR)
            </td>
          </tr>
          <tr>
            <td style={cellStyles}>01</td>
            <td style={cellStyles}>
              Software Development charges between {data?.startDate} to {data?.endDate}
              <br />
              {data?.days} Days @ ₹{data?.supplier?.rate}/Day
            </td>
            <td colSpan={2} style={cellStyles}>
              ₹{data?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyles}>
              Total
            </td>
            <td colSpan={2} style={cellStyles}>
              ₹{data?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cellStyles}>
              Amount in Words: {data?.amountInWords}
            </td>
          </tr>
          <tr>
            <td style={cellStyles}>
              Bank Account Details:
              <br />
              Name: {data?.supplier?.bank?.name}
              <br />
              Bank Name: {data?.supplier?.bank?.bankName}
              <br />
              A/C No: {data?.supplier?.bank?.accountNo}
              <br />
              IFSC: {data?.supplier?.bank?.ifsc}
              <br />
              PAN: {data?.supplier?.pan}
            </td>
            <td colSpan={3} style={signatureStyles}>
              For ({data?.supplier?.name})
              <br />
              (Authorized Signatory)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceComponent;