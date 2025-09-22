import { createHashRouter } from 'react-router-dom';
import Home from './pages/Home/Home'
import Data from './pages/Data/Data/Data';
import FormData from './pages/Data/FormData/FormData';
import NewTable from './pages/Table/NewTable/NewTable';
import App from './App';
import Struct from './pages/Table/Struct/Struct';

const router = createHashRouter([
    {
        path: '/',
        element: <App />,  // App deve conter os NavLinks
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/data/:tableName',
                element: <Data />,
            },
            {
                path: '/data/form/:tableName',
                element: <FormData />,
            },
            {
                path: '/data/form/:tableName/:id',
                element: <FormData />,
            },
            {
                path: '/tables/new',
                element: <NewTable />,
            },
            {
                path: '/tables/struct/:tableName',
                element: <Struct />,
            },
        ]
    }
]);

export default router