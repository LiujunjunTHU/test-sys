import CrudPage from '../components/CrudPage';

const fields = [
  { name: 'fact_code', label: '廠商代碼', required: true },
  { name: 'fact_name', label: '廠商名稱', required: true },
  { name: 'remark',    label: '備註說明', required: false },
];

export default function FactPage() {
  return (
    <CrudPage
      title="廠商資料維護"
      apiPath="/api/fact"
      fields={fields}
      keyField="fact_code"
    />
  );
}
