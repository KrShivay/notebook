import React from "react";
import { Address } from "@/types/supplier";

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
    address: Address;
    pan: string;
    bankDetails: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
      branch: string;
    };
    rate: number;
  };
  client: {
    name: string;
    address: Address;
    gstin: string;
  };
}

interface InvoiceComponentProps {
  data: InvoiceData;
}

const formatAddress = (address: Address): string => {
  return `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
};

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
              {data?.supplier?.address ? formatAddress(data.supplier.address) : ""}
              <br />
              PAN: {data?.supplier?.pan}
            </td>
            <td colSpan={3} style={{...cellStyles, textAlign: "right"}}>
              <strong>Client</strong>
              <br />
              {data?.client?.name}{" "}
              {data?.client?.address ? formatAddress(data.client.address) : ""}
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
              Software Development charges between {data?.startDate} to{" "}
              {data?.endDate}
              <br />
              {data?.days} Days @ ₹{data?.supplier?.rate}/Day
            </td>
            <td colSpan={2} style={cellStyles}>
              <strong>
                ₹
                {data?.amount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </td>
          </tr>

          <tr>
            <td style={cellStyles}></td>
            <td style={cellStyles}>Total</td>
            <td colSpan={2} style={cellStyles}>
              <strong>
                ₹
                {data?.amount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cellStyles}>
              <strong>Amount in Words: {data?.amountInWords}</strong>
            </td>
          </tr>
          <tr>
            <td style={cellStyles}>Bank Account Details</td>
            <td colSpan={4} style={cellStyles}></td>
          </tr>
          <tr>
            <td style={cellStyles}>
              Name: {data?.supplier?.bankDetails?.accountName}
              <br />
              Bank Name: {data?.supplier?.bankDetails?.bankName}
              <br />
              A/C No: {data?.supplier?.bankDetails?.accountNumber}
              <br />
              IFSC: {data?.supplier?.bankDetails?.ifscCode}
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
