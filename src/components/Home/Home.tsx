import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ando_desafio_capri');
  }, [navigate]);

  return <div></div>;
};

export default Home;
