import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, updateUserRole } from '../../actions/adminActions';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin: auto;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 1em;
  text-align: left;
`;

const TableHead = styled.th`
  background-color: ${({ theme }) => theme.textColor};
  color: white;
  text-align: center;
  padding: 10px;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.textColor};
`;

const TableData = styled.td`
  text-align: center;
  padding: 10px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.buttonBackground};
  color: ${({ theme }) => theme.buttonText};
  border: 2px solid ${({ theme }) => theme.textColor};
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.buttonHoverBackground};
  }
`;

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { users, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleRoleChange = (id, role) => {
    dispatch(updateUserRole(id, role));
  };

  return (
    <Container>
      <h2>Manage Users</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <UserTable>
        <thead>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <TableRow key={user._id}>
              <TableData>{user.name}</TableData>
              <TableData>{user.email}</TableData>
              <TableData>{user.role}</TableData>
              <TableData>
                <Button onClick={() => handleRoleChange(user._id, user.role === 'user' ? 'admin' : 'user')}>
                  {user.role === 'user' ? 'Promote to Admin' : 'Demote to User'}
                </Button>
              </TableData>
            </TableRow>
          ))}
        </tbody>
      </UserTable>
    </Container>
  );
};

export default ManageUsers;
