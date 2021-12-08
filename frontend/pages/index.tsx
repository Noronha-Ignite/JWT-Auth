import type { NextPage } from 'next';
import { FormEvent, useState } from 'react';

const Home: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const data = {
      email,
      password,
    };

    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type='submit'>Entrar</button>
    </form>
  );
};

export default Home;
