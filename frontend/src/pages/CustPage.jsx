import CrudPage from '../components/CrudPage';

const fields = [
  { name: 'cust_code', label: '客戶代碼', required: true },
  { name: 'cust_name', label: '客戶名稱', required: true },
  { name: 'remark',    label: '備註說明', required: false },
];

export default function CustPage() {
  return (
    <CrudPage
      title="客戶資料維護"
      apiPath="/api/cust"
      fields={fields}
      keyField="cust_code"
    />
  );
}
