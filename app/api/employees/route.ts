import { NextRequest, NextResponse } from 'next/server'

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    // Mock employee data
    const employees = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
        department: 'IT',
        status: 'Active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Manager',
        department: 'HR',
        status: 'Active',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        role: 'Employee',
        department: 'Sales',
        status: 'Active',
        createdAt: '2024-02-01'
      }
    ]

    return NextResponse.json({
      success: true,
      data: employees,
      total: employees.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST /api/employees
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock creating a new employee
    const newEmployee = {
      id: Date.now(), // Simple ID generation
      name: body.name,
      email: body.email,
      role: body.role,
      department: body.department || 'General',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: 'Employee created successfully'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

// PUT /api/employees
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Mock updating an employee
    const updatedEmployee = {
      id: body.id,
      name: body.name,
      email: body.email,
      role: body.role,
      department: body.department,
      status: body.status || 'Active',
      updatedAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Mock deleting an employee
    return NextResponse.json({
      success: true,
      message: `Employee with ID ${id} deleted successfully`
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}