import { useEffect, useState } from 'react';
import { businessService } from '../../services/business.service';
import type { Business } from '../../types/types';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const business = await businessService.getMyBusiness();

        setBusiness(business);
      } catch (error) {
        console.error('Error fetching business:', error.data?.message);
        setBusiness(null);
      }
    };

    fetchBusiness();
  }, []);

  if (!business) {
    return (
      <div>
        No se encontró ningún perfil de negocio. Si sos prestador de servicios, por favor crea una solicitud de verificación.
        <Link to='/create-business' className='rounded-xl font-sans text-sm font-bold text-sage-800'>
          Crear perfil de negocio
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p>Business Name: {business?.business_name}</p>
      <p>Business Description: {business?.description}</p>
      <p>Business Contact Email: {business?.contact_email}</p>
      <p>Business Contact Phone: {business?.contact_phone}</p>
      {!business.verified && <div>Tu negocio todavia esta pendiente de verificacion por un administrador.</div>}
    </div>
  );
};

export default Dashboard;
