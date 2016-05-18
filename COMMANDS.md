#Commands

##Help

`daplie help`

##Manage Accounts

`daplie accounts`

##Manage Addresses
  
`daplie addresses`
  
##Authentication (login, logout)

`daplie auth`
 
##Manage IP devices

`daplie devices`
  
##Manage DNS

`daplie dns`

##Domain Purchase or Management

`daplie domains`

##Manage Payment Methods
  
`daplie wallet`
  
##Login

To login with your OAuth3 credentials run:

`daplie login`

#Domains

##Domain Search/Purchase Domains

`daplie domains:search`

##List Purchased Domains

`daplie domains:list`

##Attach Device

`daplie domains:attach`


####Example: 

`daplie devices:attach -d 'devicename' -n 'domainname'`

##Detach Device

`daplie domains:detach`


####Example: 

`daplie devices:detach -d 'devicename' -n 'domainname'`
