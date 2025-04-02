import React,{useState} from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

function StockTable({data , handleDelete}) {

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const handleDeleteClick = (itemId) => {
    setDeletingItemId(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deletingItemId);
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

    const columns = [
      { field: "id", headerName: "S. No." , width:50 },
      { field: "itemName", headerName: "Item Name" , flex:1 },
      { field: "category", headerName: "Category",flex:1},
      { field: "quantity", headerName: "Quantity",  flex:1 },
      { field: "price", headerName: "Price", flex:1 },
        { field: "actions", headerName: "Actions", flex:1,
          renderCell: (params) => (
            <div>
        
              <Link to={`/admin/stocks/editstock/${params.row._id}`}>
                <IconButton>
                  <EditIcon  className="text-green-600"/>
                </IconButton>
              </Link>
              <IconButton onClick={() => handleDeleteClick(params.row._id)}>
                <DeleteIcon  className="text-red-600" />
              </IconButton>
            </div>
          ),
        },
      ];

 
  
  const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({ id: index + 1, ...item})) : [];
  return (
 
    // <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md">
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
    <div className=" w-full dark:text-white dark:bg-secondary-dark-bg">
      <DataGrid
        rows={dataWithIds}
        columns={columns}
        
      />
      </div>
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default StockTable;


