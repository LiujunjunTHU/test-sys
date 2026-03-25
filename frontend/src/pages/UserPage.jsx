import CrudPage from '../components/CrudPage';

const fields = [
  { name: 'userid',   label: '用戶代碼', required: true },
  { name: 'username', label: '用戶名稱', required: true },
  { name: 'pwd',      label: '密碼',     required: true },
];

export default function UserPage() {
  return (
    <CrudPage
      title="用戶資料維護"
      apiPath="/api/user"
      fields={fields}
      keyField="userid"
    />
  );
}
