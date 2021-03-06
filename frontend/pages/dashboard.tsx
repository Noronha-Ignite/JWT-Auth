import { Can } from '../components/Can';
import { useAuth } from '../contexts/AuthContext';
import { setUpApiClient } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sair</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
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
