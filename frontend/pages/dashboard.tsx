import { Can } from '../components/Can';
import { useAuth } from '../contexts/AuthContext';
import { setUpApiClient } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>

      <h1>Dashboard: {user?.email}</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setUpApiClient(ctx);

  const response = await apiClient.get('/me');

  console.log(response.data);

  return {
    props: {},
  };
});
