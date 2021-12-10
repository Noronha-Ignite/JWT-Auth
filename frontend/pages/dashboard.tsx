import { useAuth } from '../contexts/AuthContext';
import { useCan } from '../hooks/useCan';
import { setUpApiClient } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  console.log(user);

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
  });

  return (
    <>
      {userCanSeeMetrics && <div>Métricas</div>}

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
