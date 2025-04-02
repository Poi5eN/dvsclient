

export const PurchaseSearchQuotation= async (payload) => {

    try {
      const option = {
        method: "post",
        data: payload,
      };
      
      const data = await makeApiRequest(
       ` ${apiUrls?.SearchQuotation}`,
        option
      );
      
      return data;
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };